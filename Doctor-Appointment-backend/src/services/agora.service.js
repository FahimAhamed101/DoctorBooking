require("dotenv").config();
const crypto = require("crypto");
const { RtcTokenBuilder, RtcRole } = require("agora-token");
const ApiError = require("../utils/ApiError");
const { appointmentService } = require(".");

const agoraAppId = process.env.AGORA_APP_ID;
const agoraAppCertificate = process.env.AGORA_APP_CERTIFICATE;

const makeAgoraUid = (seed) => {
  const hash = crypto.createHash("md5").update(seed).digest("hex");
  const num = parseInt(hash.slice(0, 8), 16);
  return (num % 2147483647) + 1; // ensure valid positive UID
};

/**
 * Generate Agora RTC token for video call
 * @param {string} appointmentId - Appointment ID
 * @param {string} userId - User ID (can be doctor or patient)
 * @param {string} role - 'publisher' or 'subscriber'
 * @returns {Object} Token and channel details
 */
const generateAgoraToken = async (
  appointmentId,
  userId,
  role = "publisher"
) => {
  try {
    if (!agoraAppId || !agoraAppCertificate) {
      throw new ApiError(500, "Agora credentials not configured");
    }

    const appointment = await appointmentService.getAppointmentByMainId(
      appointmentId
    );

    // Use appointment ID as channel name (must be unique)
    const channelName = `appointment_${appointmentId}`;

    // Use deterministic UID per user + appointment to avoid UID conflicts
    const uid = makeAgoraUid(`${appointmentId}:${userId}:${role}`);

    // Set token expiration time (24 hours from now)
    const expirationTimeInSeconds = 86400; // 24 hours
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    // Determine user role
    const userRole =
      role === "publisher" ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;

    // Build the token
    const token = RtcTokenBuilder.buildTokenWithUid(
      agoraAppId,
      agoraAppCertificate,
      channelName,
      uid,
      userRole,
      privilegeExpiredTs
    );

    return {
      token,
      appId: agoraAppId,
      channelName,
      uid,
      expiresAt: new Date(privilegeExpiredTs * 1000).toISOString(),
      appointment: {
        id: appointment.id,
        topic: `${appointment.specificConditions} Appointment`,
        agenda: appointment.reason || "Medical Consultation",
        doctorEmail: appointment.doctor.email,
        patientEmail: appointment.booker.email,
      },
    };
  } catch (error) {
    throw new ApiError(500, "Agora token generation failed: " + error.message);
  }
};

/**
 * Generate tokens for both doctor and patient
 * @param {string} appointmentId - Appointment ID
 * @returns {Object} Tokens for both participants
 */
const generateAgoraMeeting = async (appointmentId) => {
  console.log("====== AGORA TOKEN GENERATION ======");
  console.log("Appointment ID:", appointmentId);
  
  try {
    const appointment = await appointmentService.getAppointmentByMainId(appointmentId);
    const channelName = `appointment_${appointmentId}`;
    const expirationTimeInSeconds = 86400;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    const doctorUid = makeAgoraUid(`${appointmentId}:${appointment.doctor.id}:publisher`);
    const patientUid = makeAgoraUid(`${appointmentId}:${appointment.booker.id}:publisher`);

    console.log("Doctor UID:", doctorUid, typeof doctorUid);
    console.log("Patient UID:", patientUid, typeof patientUid);
    console.log("Channel Name:", channelName);

    const doctorToken = RtcTokenBuilder.buildTokenWithUid(
      agoraAppId,
      agoraAppCertificate,
      channelName,
      doctorUid,
      RtcRole.PUBLISHER,
      privilegeExpiredTs
    );

    const patientToken = RtcTokenBuilder.buildTokenWithUid(
      agoraAppId,
      agoraAppCertificate,
      channelName,
      patientUid,
      RtcRole.PUBLISHER,
      privilegeExpiredTs
    );

    return {
      channelName,
      appId: agoraAppId,
      expiresAt: new Date(privilegeExpiredTs * 1000).toISOString(),
      doctor: {
        token: doctorToken,
        uid: doctorUid,
        email: appointment.doctor.email,
      },
      patient: {
        token: patientToken,
        uid: patientUid,
        email: appointment.booker.email,
      },
      appointment: {
        id: appointment.id,
        topic: `${appointment.specificConditions} Appointment`,
        agenda: appointment.reason || "Medical Consultation",
      },
    };
  } catch (error) {
    throw new ApiError(500, "Agora meeting creation failed: " + error.message);
  }
};

/**
 * Refresh an expired token
 * @param {string} channelName - Channel name
 * @param {number} uid - User ID
 * @param {string} role - 'publisher' or 'subscriber'
 * @returns {Object} New token
 */
const refreshAgoraToken = async (channelName, uid, role = "publisher") => {
  try {
    const expirationTimeInSeconds = 86400;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    const userRole =
      role === "publisher" ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;

    const token = RtcTokenBuilder.buildTokenWithUid(
      agoraAppId,
      agoraAppCertificate,
      channelName,
      uid,
      userRole,
      privilegeExpiredTs
    );

    return {
      token,
      channelName,
      uid,
      expiresAt: new Date(privilegeExpiredTs * 1000).toISOString(),
    };
  } catch (error) {
    throw new ApiError(500, "Token refresh failed: " + error.message);
  }
};

module.exports = {
  generateAgoraToken,
  generateAgoraMeeting,
  refreshAgoraToken,
};
