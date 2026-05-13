const express = require("express");
const auth = require("../../middlewares/auth");
const validate = require("../../middlewares/validate");
const { valuesController } = require("../../controllers");
const userFileUploadMiddleware = require("../../middlewares/fileUpload");
const convertHeicToPngMiddleware = require("../../middlewares/converter");
const UPLOADS_FOLDER_VALUES = "./public/uploads/other";

const uploadvALUES = userFileUploadMiddleware(UPLOADS_FOLDER_VALUES);

const router = express.Router();

router
  .route("/")
  .get(valuesController.valueList)
  .post(
    auth("superAdmin"),
    [uploadvALUES.single("icon")],
    convertHeicToPngMiddleware(UPLOADS_FOLDER_VALUES),
    valuesController.valueCreate
  );

router
  .route("/:id")
  .get(auth("superAdmin"), valuesController.valueGetById)
  .patch(
    auth("superAdmin"),
    [uploadvALUES.single("icon")],
    convertHeicToPngMiddleware(UPLOADS_FOLDER_VALUES),
    valuesController.valueUpdateById
  )
  .delete(auth("superAdmin"), valuesController.valueDeleteById);

module.exports = router;
