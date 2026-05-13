const express = require("express");
const auth = require("../../middlewares/auth");
const validate = require("../../middlewares/validate");
const { scheduleController } = require("../../controllers");

const router = express.Router();

router
  .route("/add-new")
  .post(auth("superAdmin"), scheduleController.scheduleCreate);

router
  .route("/list/:userId")
  .get(auth("common"), scheduleController.getSchedulesByUserId);

router
  .route("/:id")
  .get(auth("superAdmin"), scheduleController.scheduleGetById)
  .patch(auth("superAdmin"), scheduleController.scheduleUpdateById)
  .delete(auth("superAdmin"), scheduleController.scheduleDeleteById);

module.exports = router;
