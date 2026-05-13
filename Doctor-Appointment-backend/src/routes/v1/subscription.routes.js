const express = require("express");
const validate = require("../../middlewares/validate");
const { subscriptionController } = require("../../controllers/");
const auth = require("../../middlewares/auth");

const router = express.Router();

router
  .route("/")
  .post(auth("superAdmin"), subscriptionController.createSubscription);

router.route("/all").get(subscriptionController.getAllSubscriptions);

router
  .route("/:id")
  .get(subscriptionController.getSubscriptionById)
  .put(auth("superAdmin"), subscriptionController.updateSubscriptionById)
  .delete(auth("superAdmin"), subscriptionController.deleteSubscriptionById);

module.exports = router;
