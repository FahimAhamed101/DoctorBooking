const express = require("express");
const auth = require("../../middlewares/auth");
const validate = require("../../middlewares/validate");
const { appointmentController } = require("../../controllers");
const bodyParser = require("body-parser");

const router = express.Router();

router
  .route("/webhook")
  .post(
    bodyParser.raw({ type: "application/json" }),
    appointmentController.appointmentPayload
  );

router
  .route("/payment")
  .post(auth("common"), appointmentController.makeAppointmentPaymnt);

router
  .route("/")
  .get(auth("superAdmin"), appointmentController.listAppointments);

router
  .route("/book")
  .post(auth("common"), appointmentController.createAppointment);

  router
  .route("/book/without-login")
  .post(appointmentController.createAppointmentWithoutLogin);

router
  .route("/list")
  .get(auth("common"), appointmentController.listAppointmentsForUser);

router
  .route("/:id")
  .get(auth("common"), appointmentController.getAppointmentById)
  .patch(auth("common"), appointmentController.updateAppointmentById)
  .delete(auth("superAdmin"), appointmentController.deleteAppointmentById);

router
  .route("/admin/lists")
  .get(auth("superAdmin"), appointmentController.listAppointments);

router
  .route("/admin/write-prescription")
  .post(auth("superAdmin"), appointmentController.makeaPrescription);

module.exports = router;
