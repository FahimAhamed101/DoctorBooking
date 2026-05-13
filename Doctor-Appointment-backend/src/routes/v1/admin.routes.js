const express = require("express");
const auth = require("../../middlewares/auth");
const validate = require("../../middlewares/validate");
const { adminController } = require("../../controllers");
const userFileUploadMiddleware = require("../../middlewares/fileUpload");
const convertHeicToPngMiddleware = require("../../middlewares/converter");
const UPLOADS_FOLDER_USERS = "./public/uploads/manager";
const uploadUsers = userFileUploadMiddleware(UPLOADS_FOLDER_USERS);

const router = express.Router();

router.get("/dashboard/totalStatus", auth("superAdmin"), adminController.getTotalStatus);
router.get("/dashboard/user-ratio", auth("superAdmin"), adminController.getUserRatio);
router.get("/dashboard/income-ratio", auth("superAdmin"), adminController.getIncomeRatio);
router.get("/users", auth("superAdmin"), adminController.getUsers);
router.get("/users/:userId", auth("superAdmin"), adminController.getUsersDetails);
router.get("/earnings", auth("superAdmin"), adminController.getAllTransactions);
router.get("/earning/:transactionId", auth("superAdmin"), adminController.getAllTransactions);


// router.route("/get-profiles").get(auth("admin"), userController.getUsers);
// router.route("/get-payment").get(auth("admin"), adminController.getPayments);

// router.route("/user/block").post(auth("admin"), adminController.blockUser);
// router.route("/user/unblock").post(auth("admin"), adminController.unBlockUser);
// router.route("/unblock-users").get(auth("admin"), adminController.getBlockUser);


module.exports = router;
