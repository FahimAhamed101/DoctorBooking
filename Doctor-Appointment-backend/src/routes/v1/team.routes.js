const express = require("express");
const validate = require("../../middlewares/validate");
const { teamController } = require("../../controllers/");
const auth = require("../../middlewares/auth");
const teamFileUploadMiddleware = require("../../middlewares/fileUpload");
const convertHeicToPngMiddleware = require("../../middlewares/converter");
const UPLOADS_FOLDER_TEAM = "./public/uploads/users";

const uploadTeam = teamFileUploadMiddleware(UPLOADS_FOLDER_TEAM);

const router = express.Router();

router
  .route("/create-member")
  .post(
    auth("superAdmin"),
    [uploadTeam.single("profileImage")],
    convertHeicToPngMiddleware(UPLOADS_FOLDER_TEAM),
    teamController.createTeam
  );

router.route("/member/all").get(teamController.getAllTeams);

router.route("/about-me").get(teamController.getAboutMeShowTeam);


router
  .route("/member/:id")
  .get(teamController.getTeamById)
  .put(
    auth("superAdmin"),
    [uploadTeam.single("profileImage")],
    convertHeicToPngMiddleware(UPLOADS_FOLDER_TEAM),
    teamController.updateTeamById
  )
  .delete(auth("superAdmin"), teamController.deleteTeamById);

router
  .route("/member/:teamId/degrees")
  .post(auth("superAdmin"), teamController.addDegrees)
  .delete(auth("superAdmin"), teamController.deleteDegrees);

router
  .route("/member/:teamId/experience")
  .post(auth("superAdmin"), teamController.addExperience)
  .delete(auth("superAdmin"), teamController.deleteExperience);

router
  .route("/member/:teamId/achievements")
  .post(auth("superAdmin"), teamController.addAchievements)
  .delete(auth("superAdmin"), teamController.deleteAchievements);

module.exports = router;
