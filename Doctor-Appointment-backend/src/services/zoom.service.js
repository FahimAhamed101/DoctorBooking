require("dotenv").config();
const base64 = require("base-64");
const ApiError = require("../utils/ApiError");
const { appointmentService } = require(".");

const zoomAccountId = process.env.Zoom_Account_ID;
const zoomClientId = process.env.Zoom_Client_ID;
const zoomClientSecret = process.env.Zoom_Client_Secret;

// Dynamic import for node-fetch
const fetchPromise = import("node-fetch")
  .then((module) => module.default)
  .catch((err) => {
    console.error("Failed to import node-fetch", err);
    throw err;
  });

const getAuthHeaders = () => ({
  Authorization: `Basic ${base64.encode(
    `${zoomClientId}:${zoomClientSecret}`
  )}`,
  "Content-Type": "application/x-www-form-urlencoded",
});

const generateZoomAccessToken = async () => {
  const fetch = await fetchPromise;
  try {
    const response = await fetch(
      `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${zoomAccountId}`,
      { method: "POST", headers: getAuthHeaders() }
    );
    const jsonResponse = await response.json();
    return jsonResponse?.access_token;
  } catch (error) {
    throw new ApiError(500, "Zoom authentication failed");
  }
};

const generateZoomMeeting = async (appointmentId) => {
  const fetch = await fetchPromise;
  try {
    const appointment = await appointmentService.getAppointmentByMainId(
      appointmentId
    );
    const zoomAccessToken = await generateZoomAccessToken();

    const receiverEmail = appointment.doctor.email;
    const senderEmail = appointment.booker.email;

    const response = await fetch("https://api.zoom.us/v2/users/me/meetings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${zoomAccessToken}`,
      },
      body: JSON.stringify({
        topic: `${appointment.specificConditions} Appointment"`,
        agenda: appointment.reason || "Medical Consultation",
        type: 2,
        duration: 30,
        start_time: new Date().toISOString(),
        timezone: "Asia/Dhaka",
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: true,
          mute_upon_entry: false,
          waiting_room: false,
        },
      }),
    });

    const jsonResponse = await response.json();
    if (!response.ok) throw new ApiError(response.status, jsonResponse.message);

    return {
      meetingId: jsonResponse.id,
      joinUrl: jsonResponse.join_url,
      startUrl: jsonResponse.start_url,
      password: jsonResponse.password,
    };
  } catch (error) {
    throw new ApiError(500, "Zoom meeting creation failed: " + error.message);
  }
};



module.exports = { generateZoomMeeting };
