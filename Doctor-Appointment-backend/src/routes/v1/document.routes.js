const express = require("express");
const auth = require("../../middlewares/auth");
const userFileUploadMiddleware = require("../../middlewares/fileUpload");
const convertHeicToPngMiddleware = require("../../middlewares/converter");
const { documentController } = require("../../controllers");

const UPLOADS_FOLDER_FILES = "./public/uploads/files";
const uploadDocument = userFileUploadMiddleware(UPLOADS_FOLDER_FILES);

const router = express.Router();

router
  .route("/")
  .post(
    auth("common"),
    uploadDocument.fields([{ name: "files", maxCount: 8 }]),
    convertHeicToPngMiddleware(UPLOADS_FOLDER_FILES),
    documentController.createDocument
  );

router.route("/all").get(auth("common"), documentController.getAllDocuments);

router
  .route("/user/history")
  .get(auth("common"), documentController.getAllUserDocuments);

router
  .route("/detels/:id")
  .get(auth("common"), documentController.getDocumentById)

router
  .route("/:id")
  .put(
    auth("common"),
    uploadDocument.fields([{ name: "files", maxCount: 8 }]),
    convertHeicToPngMiddleware(UPLOADS_FOLDER_FILES),
    documentController.updateDocumentById
  )
  .delete(auth("common"), documentController.deleteDocumentById);

module.exports = router;
