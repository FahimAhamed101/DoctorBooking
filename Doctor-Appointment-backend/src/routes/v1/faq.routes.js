const express = require("express");
const auth = require("../../middlewares/auth");
const validate = require("../../middlewares/validate");
const { faqController } = require("../../controllers");

const router = express.Router();

router
    .route("/")
    .get(faqController.faqList)
    .post(auth("superAdmin"), faqController.faqCreate);

router
    .route("/:id")
    .get(auth("superAdmin"), faqController.faqGetById)
    .patch(auth("superAdmin"), faqController.faqUpdateById)
    .delete(auth("superAdmin"), faqController.faqDeleteById);

module.exports = router;
