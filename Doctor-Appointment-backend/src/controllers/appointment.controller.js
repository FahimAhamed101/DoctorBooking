const httpStatus = require("http-status");
const pick = require("../utils/pick");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const response = require("../config/response");

const {
  appointmentService,
  userService,
  conversationService,
  stripeService,
  transactionService,
  documentService,
} = require("../services");
const sendNotification = require("../utils/notification");

const {
  sendNewAppointmentEmail,
  sendConfirmAppointmentEmail,
} = require("../services/email.service");
const app = require("../app");
const { send } = require("micro");
const pdf = require('html-pdf-node');

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const ejs = require('ejs');

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const createAppointment = catchAsync(async (req, res) => {
  const { status, paymentMethod, specificConditions } = req.body;
  const supperAdmin = await userService.getUserByRole("superAdmin");

  if (!supperAdmin) {
    throw new ApiError(httpStatus.NOT_FOUND, "Admin not found");
  }

  if (status) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Status not allowed");
  }

  if (req.user.role === "superAdmin") {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "You cannot book an appointment as a super admin"
    );
  }

  if (paymentMethod) {
    req.body.paymentDetails = {
      method: paymentMethod,
    };
  }

  if (!paymentMethod) {
    req.body.paymentDetails = {
      method: "online",
    };
  }

  req.body.doctor = supperAdmin._id;
  req.body.booker = req.user.id;
  req.body.status = "pending";

  const appointment = await appointmentService.createAppointment(req.body);

  const notificationData = {
    title: "New Appointment Booking",
    content: `Appointment with ${appointment.patientName} on ${appointment.date} at ${appointment.timeSlot}`,
    icon: "https://cdn-icons-png.flaticon.com/512/10620/10620360.png",
    role: "user",
    type: "appointment",
    appointmentId: appointment._id,
    sendBy: req.user.id,
  };
 // await sendNotification(req.user, notificationData);

//  const adminNotificationData = {
 //   title: "New Appointment Booking",
  //  content: `Appointment with ${appointment.patientName} on ${appointment.date} at ${appointment.timeSlot}`,
  //  icon: "https://cdn-icons-png.flaticon.com/512/10620/10620360.png",
   // role: "superAdmin",
  //  type: "appointment",
  //  appointmentId: appointment._id,
   // sendBy: req.user.id,
 // };
 // await sendNotification(supperAdmin, adminNotificationData);

//  await sendNewAppointmentEmail(supperAdmin.email, appointment);

  await conversationService.makeConversation(
    req.user.id,
    supperAdmin._id,
    appointment._id,
    (title = `${specificConditions} Appointment`)
  );

  res.status(httpStatus.CREATED).json(
    response({
      message: "Appointment Created",
      status: "OK",
      statusCode: httpStatus.CREATED,
      data: appointment,
    })
  );
});

const createAppointmentWithoutLogin = catchAsync(async (req, res) => {
  const { status, paymentMethod, specificConditions, patientEmail, deviceGUID, amount } = req.body;
  const supperAdmin = await userService.getUserByRole("superAdmin");

  if (!supperAdmin) {
    throw new ApiError(httpStatus.NOT_FOUND, "Admin not found");
  }

  if(!patientEmail || !deviceGUID){
    throw new ApiError(httpStatus.BAD_REQUEST, "Email and Device GUID are required");
  }

  if (status) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Status not allowed");
  }


  if (paymentMethod) {
    req.body.paymentDetails = {
      method: paymentMethod,
    };
  }

  if (!paymentMethod) {
    req.body.paymentDetails = {
      method: "online",
    };
  }

  req.body.doctor = supperAdmin._id;
  req.body.deviceGUID = req.body.deviceGUID || "web-guest";
  req.body.status = "pending";

  const appointment = await appointmentService.createAppointment(req.body);

  const notificationData = {
    title: "New Appointment Booking",
    content: `Appointment with ${appointment.patientName} on ${appointment.date} at ${appointment.timeSlot}`,
    icon: "https://cdn-icons-png.flaticon.com/512/10620/10620360.png",
    role: "guest",
    type: "appointment",
    appointmentId: appointment._id,

  };
 

//  const adminNotificationData = {
  //  title: "New Appointment Booking",
  //  content: `Appointment with ${appointment.patientName} on ${appointment.date} at ${appointment.timeSlot}`,
  //  icon: "https://cdn-icons-png.flaticon.com/512/10620/10620360.png",
  //  role: "superAdmin",
  //  type: "appointment",
  //  appointmentId: appointment._id,
 // };
 // await sendNotification(supperAdmin, adminNotificationData);

 // await sendNewAppointmentEmail(patientEmail, appointment, notificationData);


 // await sendNewAppointmentEmail(supperAdmin.email, appointment, adminNotificationData);

  await conversationService.makeConversation(
     req.user.id,
     supperAdmin._id,
   appointment._id,
  (title = `${specificConditions} Appointment`)
   );

  const paymentData = {
    quantity: 1,
    amount: amount,
    currency: "usd",
    name: `Payment for Appointment - ${appointment.patientName}`,
    metadata: {
      deviceGUID: deviceGUID,
      type: "guest",
      email: patientEmail,
      appointmentId: appointment.appointmentId,
      description: `Payment for appointment with ${appointment.patientName} on ${appointment.date} at ${appointment.timeSlot}`,
    },
  };

  const stripePay = await stripeService.stripeOneTimePayment(paymentData);

  const transactionDetails = {
    deviceGUID: deviceGUID,
    amount: amount,
    checkoutSessionId: stripePay.id,
    appointment: appointment.id,
    mode: stripePay.mode,
    status: "panding",
    stripeInfo: stripePay,
  };

  await transactionService.createNewTransaction(
    transactionDetails
  );



  res.status(httpStatus.CREATED).json(
    response({
      message: "Appointment Created. Please make payment to confirm the appointment.",
      status: "OK",
      statusCode: httpStatus.CREATED,
      data: {appointment, paymentLink: stripePay.url},
    })
  );
});

const makeAppointmentPaymnt = catchAsync(async (req, res) => {
  const { appointmentId, amount } = req.body;

  if (!appointmentId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Appointment ID is required");
  }

  const appointment = await appointmentService.getAppointmentById(
    appointmentId
  );

  if (!appointment) {
    throw new ApiError(httpStatus.NOT_FOUND, "Appointment not found");
  }

  if (appointment.status !== "pending") {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Payment can only be made for pending appointments"
    );
  }

  const paymentData = {
    quantity: 1,
    amount: amount,
    currency: "usd",
    name: `Payment for Appointment - ${appointment.patientName}`,
    metadata: {
      userId: req.user.id,
      email: req.user.email,
      type: "user",
      appointmentId: appointment.appointmentId,
      description: `Payment for appointment with ${appointment.patientName} on ${appointment.date} at ${appointment.timeSlot}`,
    },
  };

  const stripePay = await stripeService.stripeOneTimePayment(paymentData);

  const transactionDetails = {
    user: req.user.id,
    amount: amount,
    checkoutSessionId: stripePay.id,
    appointment: appointment.id,
    mode: stripePay.mode,
    status: "panding",
    stripeInfo: stripePay,
  };

  await transactionService.createNewTransaction(
    transactionDetails
  );

  res.status(httpStatus.OK).json(
    response({
      message: "Payment Successful",
      status: "OK",
      statusCode: httpStatus.OK,
      data: stripePay.url,
    })
  );
});

// const appointmentPayload = catchAsync(async (req, res) => {
//   let event = req.body;
//   const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

//   if (endpointSecret) {
//     const signature = req.headers["stripe-signature"];
//     try {
//       event = stripe.webhooks.constructEvent(
//         req.rawBody,
//         signature,
//         endpointSecret
//       );
//     } catch (err) {
//       console.log(`⚠️ Webhook signature verification failed.`, err.message);
//       return res.sendStatus(400);
//     }
//   }
//   let status;
//   console.log("event type", event.type);
//   switch (event.type) {
//     case "checkout.session.completed":
//       const checkoutSession = event.data.object;

//       console.log("Checkout session completed:", checkoutSession);

//       const user = await userService.getUserById(
//         checkoutSession.metadata?.userId
//       );

//       const transaction =
//         await transactionService.getTransactionByStripeSheckoutId(
//           checkoutSession.id
//         );

//       if (!transaction) {
//         throw new ApiError(
//           httpStatus.NOT_FOUND,
//           "Transaction not found for the provided session ID"
//         );
//       }

//       transaction.status = "completed";
//       transaction.stripeInfo = checkoutSession;
//       await transaction.save();

//       const appointment = await appointmentService.getAppointmentByMainId(
//         transaction.appointment
//       );
//       if (!appointment) {
//         throw new ApiError(
//           httpStatus.NOT_FOUND,
//           "Appointment not found for the provided transaction"
//         );
//       }

//       appointment.status = "confirmed";
//       appointment.isPaid = true;
//       appointment.paymentDetails = {
//         method: "online",
//         transactionId: transaction._id,
//         paidAt: new Date(),
//       };
//       await appointment.save();

//       if(user){

//       const notificationData = {
//         title: "Appointment Payment Confirmed",
//         content: `Payment for appointment with ${appointment.patientName} on ${appointment.date} at ${appointment.timeSlot} has been confirmed.`,
//         icon: "https://cdn-icons-png.flaticon.com/512/10620/10620360.png",
//         role: "user",
//         type: "appointment",
//         appointmentId: appointment._id,
//         sendBy: user.id,
//       };
//       await sendNotification(user, notificationData);

//       await sendConfirmAppointmentEmail(user.email, appointment);
//     } 

//       const supperAdmin = await userService.getUserByRole("superAdmin");                  

//     default:
//       console.log(`Unhandled event type ${event.type}.`);
//   }
//   res.send();
// });

const appointmentPayload = catchAsync(async (req, res) => {
  let event = req.body;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (endpointSecret) {
    const signature = req.headers["stripe-signature"];
    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        endpointSecret
      );
    } catch (err) {
      console.log(`⚠️ Webhook signature verification failed.`, err.message);
      return res.sendStatus(400);
    }
  }

  console.log("event type", event.type);
  switch (event.type) {
    case "checkout.session.completed":
      const checkoutSession = event.data.object;

      console.log("Checkout session completed:", checkoutSession);

      // Make user lookup optional
      let user = null;
      if (checkoutSession.metadata?.userId) {
        try {
          user = await userService.getUserById(checkoutSession.metadata.userId);
        } catch (error) {
          console.log("User not found or invalid user ID:", error.message);
        }
      }

      const transaction = await transactionService.getTransactionByStripeSheckoutId(
        checkoutSession.id
      );

      if (!transaction) {
        throw new ApiError(
          httpStatus.NOT_FOUND,
          "Transaction not found for the provided session ID"
        );
      }

      transaction.status = "completed";
      transaction.stripeInfo = checkoutSession;
      await transaction.save();

      const appointment = await appointmentService.getAppointmentByMainId(
        transaction.appointment
      );
      if (!appointment) {
        throw new ApiError(
          httpStatus.NOT_FOUND,
          "Appointment not found for the provided transaction"
        );
      }

      appointment.status = "confirmed";
      appointment.isPaid = true;
      appointment.paymentDetails = {
        method: "online",
        transactionId: transaction._id,
        paidAt: new Date(),
      };
      await appointment.save();

      // Handle notifications and emails for both user and guest scenarios
      const supperAdmin = await userService.getUserByRole("superAdmin");

      // Determine email and notification details based on user or guest
      const emailToSend = user 
        ? user.email 
        : checkoutSession.metadata?.email || appointment.patientEmail;

      const notificationData = {
        title: "Appointment Payment Confirmed",
        content: `Payment for appointment with ${appointment.patientName} on ${appointment.date} at ${appointment.timeSlot} has been confirmed.`,
        icon: "https://cdn-icons-png.flaticon.com/512/10620/10620360.png",
        role: user ? "user" : "guest",
        type: "appointment",
        appointmentId: appointment._id,
        sendBy: user ? user.id : null,
      };

      // Send admin notification
      const adminNotificationData = {
        ...notificationData,
        role: "superAdmin"
      };

      // Send notification to admin
      if (supperAdmin) {
        await sendNotification(supperAdmin, adminNotificationData);
      }

      // Send notification to user/guest if possible
      if (user) {
        await sendNotification(user, notificationData);
      }

      // Send confirmation email
      await sendConfirmAppointmentEmail(emailToSend, appointment);

      break;

    default:
      console.log(`Unhandled event type ${event.type}.`);
  }
  
  res.send();
});

const getAppointmentById = catchAsync(async (req, res) => {
  const appointment = await appointmentService.getAppointmentById(
    req.params.id
  );

  res.status(httpStatus.OK).json(
    response({
      message: "Appointment Retrieved",
      status: "OK",
      statusCode: httpStatus.OK,
      data: appointment,
    })
  );
});

const updateAppointmentById = catchAsync(async (req, res) => {
  const appointment = await appointmentService.updateAppointmentById(
    req.params.id,
    req.body
  );

  res.status(httpStatus.OK).json(
    response({
      message: "Appointment Updated",
      status: "OK",
      statusCode: httpStatus.OK,
      data: appointment,
    })
  );
});

const deleteAppointmentById = catchAsync(async (req, res) => {
  const appointment = await appointmentService.deleteAppointmentById(
    req.params.id
  );

  res.status(httpStatus.OK).json(
    response({
      message: "Appointment Deleted",
      status: "OK",
      statusCode: httpStatus.OK,
      data: appointment,
    })
  );
});

const listAppointments = catchAsync(async (req, res) => {
  const filter = pick(req.query, [
    "patientName",
    "patientEmail",
    "patientPhone",
    "patientGender",
    "patientAddress",
    "visitType",
    "department",
    "bodyPart",
    "date",
    "timeSlot",
    "status",
  ]);

  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const result = await appointmentService.queryAppointments(filter, options);

  res.status(httpStatus.OK).json(
    response({
      message: "Appointments",
      status: "OK",
      statusCode: httpStatus.OK,
      data: result,
    })
  );
});


const listAppointmentsForUser = catchAsync(async (req, res) => {
  const filter = pick(req.query, [
    "patientName",
    "patientEmail",
    "patientPhone",
    "patientGender",
    "patientAddress",
    "visitType",
    "department",
    "bodyPart",
    "date",
    "timeSlot",
    "status",
  ]);

  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const result = await appointmentService.queryAppointmentsForUser(
    filter,
    options,
    req.user.id
  );

  res.status(httpStatus.OK).json(
    response({
      message: "Appointments",
      status: "OK",
      statusCode: httpStatus.OK,
      data: result,
    })
  );
});

// const makeaPrescription = catchAsync(async (req, res) => {
//   const { appointmentId, items } = req.body;

//   if (!appointmentId) {
//     throw new ApiError(httpStatus.BAD_REQUEST, "Appointment ID is required");
//   }

//   const appointment = await appointmentService.getAppointmentById(appointmentId);
//   if (!appointment) {
//     throw new ApiError(httpStatus.NOT_FOUND, "Appointment not found");
//   }

//   const appointmentBooker = await userService.getUserById(appointment.booker);

//   if (!appointmentBooker) {
//     throw new ApiError(httpStatus.NOT_FOUND, "Appointment booker not found");
//   }

//   // Step 1: Render the HTML from ejs template
//   const html = await ejs.renderFile(path.join(__dirname, '../views', 'prescription.ejs'), {
//   patientName: appointment.patientName,
//   address: appointment.patientAddress,
//   phoneNumber: appointment.patientPhone,
//   date: appointment.date,
//   timeSlot: appointment.timeSlot,
//   patientEmail: appointment.patientEmail,
//   age: appointment.patientAge,
//   gender: appointment.patientGender,
//   weight: '70 kg',
//   doctorName: 'Dr. Evan',
//   items: items // Assuming 'items' contains the medication details
// });
//   // Step 2: Generate the PDF using Puppeteer
//   const browser = await puppeteer.launch();
//   const page = await browser.newPage();
//   await page.setContent(html);
//   await page.emulateMediaType('screen'); // For better print style rendering

//   // Step 3: Define file path for the PDF
//   const pdfFileName = `${appointmentId}_prescription.pdf`;
//   const pdfPath = path.join(__dirname, 'public', 'uploads', pdfFileName);
  
//   // Step 4: Save the PDF
//   await page.pdf({ path: pdfPath, format: 'A4' });

//   await browser.close();

//   // Step 5: Create a new document in the database with the PDF file path
//   const makeNewDoc = await documentService.createDocument({
//     title: `Prescription for ${appointment.patientName}`,
//     description: `Prescription for appointment on ${appointment.date} at ${appointment.timeSlot}`,
//     type: "prescription",
//     user: appointmentBooker._id,
//     sendBy: req.user.id,
//     appointment: appointment._id,
//     content: req.body.content,
//     files: [`/uploads/${pdfFileName}`], // Store the file path for the created PDF
//   });

//   // Step 6: Send the response back with the link to the saved PDF
//   res.status(httpStatus.CREATED).json(
//     response({
//       message: "Prescription Created",
//       status: "OK",
//       statusCode: httpStatus.CREATED,
//       data: {
//         pdfLink: `/uploads/${pdfFileName}` 
//       },
//     })
//   );
// });

const makeaPrescription = catchAsync(async (req, res) => {
  const { appointmentId, items } = req.body;

  if (!appointmentId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Appointment ID is required");
  }

  const appointment = await appointmentService.getAppointmentById(appointmentId);
  if (!appointment) {
    throw new ApiError(httpStatus.NOT_FOUND, "Appointment not found");
  }

  const appointmentBooker = await userService.getUserById(appointment.booker);

  if (!appointmentBooker) {
    throw new ApiError(httpStatus.NOT_FOUND, "Appointment booker not found");
  }

  // Render EJS template to HTML
  const html = await ejs.renderFile(
    path.join(__dirname, '../views', 'prescription.ejs'),
    {
      patientName: appointment.patientName,
      address: appointment.patientAddress,
      phoneNumber: appointment.patientPhone,
      date: appointment.date,
      timeSlot: appointment.timeSlot,
      patientEmail: appointment.patientEmail,
      age: appointment.patientAge,
      gender: appointment.patientGender,
      weight: '70 kg',
      doctorName: 'Dr. Evan',
      items: items
    }
  );

  // Generate PDF using html-pdf-node
  const pdfFileName = `${appointmentId}_prescription.pdf`;
  const pdfPath = path.join(__dirname, '../../public', 'uploads/files', pdfFileName);

  const file = { content: html };

  const pdfBuffer = await pdf.generatePdf(file, { format: 'A4' });

  // Save the PDF buffer to file
  fs.writeFileSync(pdfPath, pdfBuffer);

  // Save doc to DB
  const makeNewDoc = await documentService.createDocument({
    title: `Prescription for ${appointment.patientName}`,
    description: `Prescription for appointment on ${appointment.date} at ${appointment.timeSlot}`,
    type: "prescription",
    user: appointmentBooker._id,
    sendBy: req.user.id,
    appointment: appointment._id,
    content: req.body.content,
    files: [`/uploads/files${pdfFileName}`],
  });

  res.status(httpStatus.CREATED).json(
    response({
      message: "Prescription Created",
      status: "OK",
      statusCode: httpStatus.CREATED,
      data: {
        pdfLink: `/uploads/files/${pdfFileName}`,
      },
    })
  );
});


module.exports = {
  createAppointment,
  getAppointmentById,
  updateAppointmentById,
  deleteAppointmentById,
  listAppointments,
  listAppointmentsForUser,
  makeAppointmentPaymnt,
  appointmentPayload,
  makeaPrescription,
  createAppointmentWithoutLogin,
};
