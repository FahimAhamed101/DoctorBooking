const express = require("express");
const auth = require("../../middlewares/auth");
const validate = require("../../middlewares/validate");
const { infoController, authController } = require("../../controllers");

const router = express.Router();

router
  .route("/privacy-policy")
  .post(auth("superAdmin"), infoController.createPrivacy)
  .get(infoController.queryPrivacy);

router
  .route("/terms-condition")
  .post(auth("superAdmin"), infoController.createTerms)
  .get(infoController.queryTerms);

router
  .route("/about-us")
  .post(auth("superAdmin"), infoController.createAboutUs)
  .get(infoController.queryAboutUs);

router
  .route("/support")
  .post(auth("superAdmin"), infoController.createSupport)
  .get(infoController.querySupport);

router
  .route("/notifications")
  .get(auth("common"), infoController.getAllNotifications);

router
  .route("/seen-notifications")
  .patch(auth("common"), infoController.updateNotification);

// router.route("/location").post(auth("common"), authController.updateLocation);

router.get("/aboutUs", infoController.renderAboutUsPage);
router.get("/privacy", infoController.renderPrivacyPage);
router.get("/termsAndCondition", infoController.renderTermsConditionPage);

router
  .route("/child-safety-policy")
  .post(auth("superAdmin"), infoController.createChildSafetyPolicy)
  .get(infoController.queryChildSafetyPolicy);

router.get("/childSafetyPolicy", infoController.renderChildSafetyPolicy);

module.exports = router;
