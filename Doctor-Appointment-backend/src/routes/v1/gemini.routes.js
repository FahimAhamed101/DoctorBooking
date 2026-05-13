const express = require("express");
const auth = require("../../middlewares/auth");
const validate = require("../../middlewares/validate");
const { geminiController } = require("../../controllers");

const router = express.Router();

router.route("/conversation").post(geminiController.conversitions);

router.route("/all-models").get(geminiController.allModels);

module.exports = router;
