const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const contactController = require("../../controllers/contact.controller");


router.route("/").post(contactController.createContact);
router.route("/").get(auth("superAdmin"), contactController.getContacts);
router.route("/:contactId").get(auth("superAdmin"), contactController.getContact);


module.exports = router;
