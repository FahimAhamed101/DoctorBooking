const nodemailer = require("nodemailer");
const config = require("../config/config");
const logger = require("../config/logger");

const transport = nodemailer.createTransport(config.email.smtp);
/* istanbul ignore next */
if (config.env !== "test") {
  transport
    .verify()
    .then(() => logger.info("Connected to email server"))
    .catch((err) =>
      logger.warn(
        "Unable to connect to email server. Make sure you have configured the SMTP options in .env"
      )
    );
}

const sendEmail = async (to, subject, html) => {
  const msg = { from: config.email.from, to, subject, html };
  await transport.sendMail(msg);
};

const sendEmailVerification = async (to, otp) => {
  console.log("sendEmailVerification", to, otp);
  const subject = "User verification code";
  const html = `
  <body style="background-color: #d5edff; padding: 2rem; font-family: Arial, sans-serif; color: #333;">
  <div style="max-width: 32rem; margin: 0 auto; background-color: #ffffff; padding: 2rem; border-radius: 0.75rem; box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1); text-align: center;">
      <img src="https://raw.githubusercontent.com/shadat-hossan/Image-server/refs/heads/main/main-logo.jpg" alt="Woke" style="max-width: 10rem; margin-bottom: 1.5rem;">
      <h1 style="font-size: 1.75rem; font-weight: 700; margin-bottom: 1rem; color: #77c4fe;">Welcome to Dr. Evans Website!</h1>
      <p style="color: #555555; margin-bottom: 1.5rem;">Thank you for joining Woke! Your account is almost ready.</p>
      <div style="background: linear-gradient(135deg, #77c4fe, #d5edff); color: #ffffff; padding: 1rem; border-radius: 0.5rem; font-size: 2rem; font-weight: 800; letter-spacing: 0.1rem; margin-bottom: 1.5rem;">
          ${otp}
      </div>
      <p style="color: #555555; margin-bottom: 1.5rem;">Collect this code to verify your account.</p>
      <p style="color: #ff0000; font-size: 0.85rem; margin-top: 1.5rem;">This code expires in <span id="timer">3:00</span> minutes.</p>
      <a href="https://shadat-hossain.netlify.app" style="color: #555555; font-size: 12px; text-decoration: none; margin-top: 1.5rem; display: inline-block;">ᯤ Developed by ᯤ</a>
  </div>
</body>
`;
  await sendEmail(to, subject, html);
};

const sendResetPasswordEmail = async (to, otp) => {
  console.log("Password Reset Email", to, otp);
  const subject = "Password Reset Email";
  const html = `
      <body style="background-color: #d5edff; padding: 2rem; font-family: Arial, sans-serif; color: #333;">
  <div style="max-width: 32rem; margin: 0 auto; background-color: #ffffff; padding: 2rem; border-radius: 0.75rem; box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15); text-align: center;">
      <img src="https://raw.githubusercontent.com/shadat-hossan/Image-server/refs/heads/main/main-logo.jpg" alt="Woke" style="max-width: 8rem; margin-bottom: 1.5rem;">
      <h1 style="font-size: 1.75rem; font-weight: 700; margin-bottom: 1rem; color: #77c4fe;">Password Reset Request</h1>
      <p style="color: #555555; margin-bottom: 1.5rem;">You requested a password reset for your account. Use the code below to reset your password:</p>
      <div style="background: linear-gradient(135deg, #77c4fe, #d5edff); color: #ffffff; padding: 1rem; border-radius: 0.5rem; font-size: 2rem; font-weight: 800; letter-spacing: 0.1rem; margin-bottom: 1.5rem;">
          ${otp}
      </div>
      <p style="color: #D6471C; margin-bottom: 1.5rem;">This code is valid for 3 minutes.</p>
      <p style="color: #6b7280; font-size: 0.875rem; margin-top: 1.5rem;">If you did not request a password reset, please ignore this email.</p>
      <a href="https://shadat-hossain.netlify.app" style="color: #555555; font-size: 12px; text-decoration: none; display: inline-block; margin-top: 1.5rem;">ᯤ Developed by ᯤ</a>
  </div>
</body>
`;
  await sendEmail(to, subject, html);
};

const sendVerificationEmail = async (to, token) => {
  const subject = "Email Verification";
  // replace this url with the link to the email verification page of your front-end app
  const verificationEmailUrl = `http://link-to-app/verify-email?token=${token}`;
  const text = `Dear user,
To verify your email, click on this link: ${verificationEmailUrl}
If you did not create an account, then ignore this email.`;
  await sendEmail(to, subject, text);
};

const sendContactsUsEmail = async (allData) => {
  const to = process.env.CONTACT_US_EMAIL;
  const subject = `Contact Us Email - ${allData.fullName} from Doctor Appointment e-clinic`;
  const html = `
 <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background-color: #f9fafb; color: #333;">
  <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);">
    <div style="text-align: center; margin-bottom: 20px;">
      <img src="https://raw.githubusercontent.com/shadat-hossan/Image-server/refs/heads/main/main-logo.jpg" alt="Fuez Logo" style="max-width: 100px; margin-bottom: 10px;">
      <h1 style="font-size: 1.75rem; color: #0056b3; margin: 0;">Contact Us Submission</h1>
    </div>
    <div style="background: linear-gradient(135deg, #3b82f6, #06b6d4); padding: 20px; border-radius: 10px; color: #ffffff; margin-top: 20px;">
      <h2 style="font-size: 1.5rem; margin: 0; text-align: center;">New Message from ${allData.fullName}</h2>
    </div>
    <div style="padding: 20px 0;">
      <p style="font-size: 1.125rem; line-height: 1.6; margin-bottom: 15px;">
        <strong style="color: #0056b3;"><i style="margin-right: 8px;">📧</i>Email Address:</strong> ${allData.email}
      </p>
      <p style="font-size: 1.125rem; line-height: 1.6; margin-bottom: 15px;">
        <strong style="color: #0056b3;"><i style="margin-right: 8px;">📞</i>Phone:</strong> ${allData.phoneNumber}
      </p>
      <p sty
      <p style="font-size: 1.125rem; line-height: 1.6; margin-bottom: 15px;">
        <strong style="color: #0056b3;"><i style="margin-right: 8px;">💬</i>Message:</strong> ${allData.message}
      </p>
    </div>
    <div style="text-align: center; padding: 20px; background-color: #f3f4f6; border-radius: 10px; margin-top: 30px;">
      <p style="font-size: 0.875rem; color: #555;">
        This email was sent from the "Contact Us" form on the Fuez website.
      </p>
    </div>
  </div>
</body>`;

  await sendEmail(to, subject, html);
};

const sendNewAppointmentEmail = async (to, appointmentData, notificationData) => {
  const subject = "New Appointment Booking";

  const {
    patientName,
    patientEmail,
    patientPhone,
    patientAge,
    patientGender,
    patientAddress,
    visitType,
    department,
    bodyPart,
    date,
    timeSlot,
    reason,
    paymentDetails,
    appointmentId
  } = appointmentData;

  const html = `
      <div style="font-family: Arial, sans-serif; background-color: #f6f9fc; padding: 20px;">
      <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); overflow: hidden;">
        
        <div style="background-color: #4a90e2; color: #ffffff; padding: 20px 30px;">
          <h2 style="margin: 0;">🩺 New Appointment Booking </h2>
        </div>

        <div style="padding: 20px 30px;">
          <p style="font-size: 15px; color: #555;">
            A new appointment has been booked with the following details:
          </p>

          <table cellpadding="10" cellspacing="0" style="width: 100%; font-size: 14px; border-collapse: collapse; margin-top: 10px;">
            <tr>
              <td style="font-weight: bold; color: #333;">👤 Patient Name:</td>
              <td>${patientName}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; color: #333;">📧 Email:</td>
              <td>${patientEmail}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; color: #333;">📞 Phone:</td>
              <td>${patientPhone}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; color: #333;">🎂 Age:</td>
              <td>${patientAge}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; color: #333;">⚥ Gender:</td>
              <td>${patientGender}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; color: #333;">🏠 Address:</td>
              <td>${patientAddress}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; color: #333;">📝 Visit Type:</td>
              <td>${visitType || "N/A"}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; color: #333;">🏥 Department:</td>
              <td>${department || "N/A"}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; color: #333;">🦴 Body Part:</td>
              <td>${bodyPart || "N/A"}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; color: #333;">📅 Date:</td>
              <td>${new Date(date).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; color: #333;">⏰ Time Slot:</td>
              <td>${timeSlot}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; color: #333;">📄 Reason:</td>
              <td>${reason || "N/A"}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; color: #333;">💳 Payment Method:</td>
              <td>${paymentDetails?.method || "Not specified"}</td>
            </tr>
          </table>

          <p style="margin-top: 20px; color: #777;">
            Please log into your admin dashboard to view full appointment details or take action id is <strong>${appointmentId}</strong>.
          </p>
        </div>

        <div style="background-color: #f1f1f1; padding: 15px 30px; text-align: center; font-size: 13px; color: #999;">
          This is an automated notification from your appointment system.
        </div>
      </div>
    </div>
`;
  await sendEmail(to, subject, html);
};

const sendConfirmAppointmentEmail = async (to, appointmentData) => {
  const subject = "Your Appointment is Confirmed!";

  const {
    patientName,
    patientEmail,
    patientPhone,
    patientAge,
    patientGender,
    patientAddress,
    visitType,
    department,
    bodyPart,
    date,
    timeSlot,
    reason,
    paymentDetails,
    appointmentId
  } = appointmentData;

  const html = `
      <div style="font-family: Arial, sans-serif; background-color: #f6f9fc; padding: 20px;">
      <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); overflow: hidden;">
        
        <div style="background-color: #4a90e2; color: #ffffff; padding: 20px 30px;">
          <h2 style="margin: 0;">🩺 Your Appointment is Confirmed! </h2>
        </div>

        <div style="padding: 20px 30px;">
          <p style="font-size: 15px; color: #555;">
            Your appointment has been successfully booked and payment has been confirmed. Below are the details of your appointment:
          </p>

          <table cellpadding="10" cellspacing="0" style="width: 100%; font-size: 14px; border-collapse: collapse; margin-top: 10px;">
            <tr>
              <td style="font-weight: bold; color: #333;">👤 Patient Name:</td>
              <td>${patientName}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; color: #333;">📧 Email:</td>
              <td>${patientEmail}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; color: #333;">📞 Phone:</td>
              <td>${patientPhone}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; color: #333;">🎂 Age:</td>
              <td>${patientAge}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; color: #333;">⚥ Gender:</td>
              <td>${patientGender}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; color: #333;">🏠 Address:</td>
              <td>${patientAddress}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; color: #333;">📝 Visit Type:</td>
              <td>${visitType || "N/A"}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; color: #333;">🏥 Department:</td>
              <td>${department || "N/A"}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; color: #333;">🦴 Body Part:</td>
              <td>${bodyPart || "N/A"}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; color: #333;">📅 Date:</td>
              <td>${new Date(date).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; color: #333;">⏰ Time Slot:</td>
              <td>${timeSlot}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; color: #333;">📄 Reason:</td>
              <td>${reason || "N/A"}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; color: #333;">💳 Payment Method:</td>
              <td>${paymentDetails?.method || "Not specified"}</td>
            </tr>
          </table>

          <p style="margin-top: 20px; color: #777;">
            Your appointment has been successfully confirmed. Please keep the appointment ID <strong>${appointmentId}</strong> for reference.
          </p>

          <p style="font-size: 15px; color: #555;">
            If you have any questions or need further assistance, feel free to contact us.
          </p>
        </div>

        <div style="background-color: #f1f1f1; padding: 15px 30px; text-align: center; font-size: 13px; color: #999;">
          This is an automated confirmation from your appointment system. If you did not make this booking, please contact support immediately.
        </div>
      </div>
    </div>
`;
  await sendEmail(to, subject, html);
};



module.exports = {
  transport,
  sendEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
  sendEmailVerification,
  sendContactsUsEmail,
  sendNewAppointmentEmail,
  sendConfirmAppointmentEmail
};
