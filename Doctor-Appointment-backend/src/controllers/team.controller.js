const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const response = require("../config/response");
const { teamService, scheduleService } = require("../services");
const ApiError = require("../utils/ApiError");
const pick = require("../utils/pick");

// Create a new team
const createTeam = catchAsync(async (req, res) => {
  req.body.createdBy = req.user.id;

  req.body.fullName = req.body.firstName
    ? `${req.body.firstName} ${req.body.lastName}`
    : req.body.fullName;

  if (typeof req.body.media === "string") {
    try {
      req.body.media = JSON.parse(req.body.media);
    } catch (error) {
      return res.status(httpStatus.BAD_REQUEST).send(
        response({
          status: "Error",
          statusCode: httpStatus.BAD_REQUEST,
          message: "Invalid media JSON format",
          error: error.message,
        })
      );
    }
  }

  if (typeof req.body.degrees === "string") {
    try {
      req.body.degrees = JSON.parse(req.body.degrees);
    } catch (error) {
      return res.status(httpStatus.BAD_REQUEST).send(
        response({
          status: "Error",
          statusCode: httpStatus.BAD_REQUEST,
          message: "Invalid degrees JSON format",
          error: error.message,
        })
      );
    }
  }

  if (typeof req.body.experience === "string") {
    try {
      req.body.experience = JSON.parse(req.body.experience);
    } catch (error) {
      return res.status(httpStatus.BAD_REQUEST).send(
        response({
          status: "Error",
          statusCode: httpStatus.BAD_REQUEST,
          message: "Invalid experience JSON format",
          error: error.message,
        })
      );
    }
  }

  if (typeof req.body.achievements === "string") {
    try {
      req.body.achievements = JSON.parse(req.body.achievements);
    } catch (error) {
      return res.status(httpStatus.BAD_REQUEST).send(
        response({
          status: "Error",
          statusCode: httpStatus.BAD_REQUEST,
          message: "Invalid achievements JSON format",
          error: error.message,
        })
      );
    }
  }

  if (req.file) {
    req.body.profileImage = "/uploads/users/" + req.file.filename;
  }

  const newTeam = await teamService.createTeam(req.body);
  res.status(httpStatus.CREATED).send(
    response({
      status: "OK",
      statusCode: httpStatus.CREATED,
      message: "Team created successfully",
      data: newTeam,
    })
  );
});

// Get all teams
const getAllTeams = catchAsync(async (req, res) => {
  const filter = pick(req.query, [
    "fullName",
    "designation",
    "specialties",
    "email",
  ]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const result = await teamService.queryTeams(filter, options);
  res.status(httpStatus.OK).json(
    response({
      message: "All Teams",
      status: "OK",
      statusCode: httpStatus.OK,
      data: result,
    })
  );
});

// Get a single team by ID
const getTeamById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const team = await teamService.getTeamById(id);
  if (!team) {
    return res.status(httpStatus.NOT_FOUND).send(
      response({
        status: "Error",
        statusCode: httpStatus.NOT_FOUND,
        message: "Team not found",
        error: "Team with the provided ID does not exist",
      })
    );
  }

  const scheduleList = await scheduleService.getSchedulesByUserId(id);
  
  res.status(httpStatus.OK).send(
    response({
      status: "OK",
      statusCode: httpStatus.OK,
      message: "Team retrieved successfully",
      data: {team, scheduleList},
    })
  );
});

const addDegrees = catchAsync(async (req, res) => {
  const { teamId } = req.params;
  const updatedTeam = await teamService.addDegrees(teamId, req.body);
  res.status(httpStatus.OK).send(
    response({
      status: "OK",
      statusCode: httpStatus.OK,
      message: "Degrees added",
      data: updatedTeam,
    })
  );
});

const deleteDegrees = catchAsync(async (req, res) => {
  const team = await teamService.deleteDegreeById(
    req.params.teamId,
    req.body.degreesId
  );

  res.status(httpStatus.OK).send(
    response({
      status: "OK",
      statusCode: httpStatus.OK,
      message: "Degrees removed",
      data: team,
    })
  );
});

const addExperience = catchAsync(async (req, res) => {
  const { teamId } = req.params;
  const updatedTeam = await teamService.addExperience(teamId, req.body);
  res.status(httpStatus.OK).send(
    response({
      status: "OK",
      statusCode: httpStatus.OK,
      message: "Experience added",
      data: updatedTeam,
    })
  );
});

const deleteExperience = catchAsync(async (req, res) => {
   const team = await teamService.deleteExperienceById(
    req.params.teamId,
    req.body.experienceId
  );

  res.status(httpStatus.OK).send(
    response({
      status: "OK",
      statusCode: httpStatus.OK,
      message: "Experience removed",
      data: team,
    })
  );
});

const addAchievements = catchAsync(async (req, res) => {
  const { teamId } = req.params;
  const updatedTeam = await teamService.addAchievements(teamId, req.body);
  res.status(httpStatus.OK).send(
    response({
      status: "OK",
      statusCode: httpStatus.OK,
      message: "Achievements added",
      data: updatedTeam,
    })
  );
});

const deleteAchievements = catchAsync(async (req, res) => {
  const team = await teamService.deleteAchievementById(
    req.params.teamId,
    req.body.achievementId
  );

  res.status(httpStatus.OK).send(
    response({
      status: "OK",
      statusCode: httpStatus.OK,
      message: "Achievements removed",
      data: team,
    })
  );
});

// Update a team by ID
const updateTeamById = catchAsync(async (req, res) => {
  const { id } = req.params;

  if (req.file) {
    req.body.profileImage = "/uploads/users/" + req.file.filename;
  }

  const updatedTeam = await teamService.updateTeamById(id, req.body);
  if (!updatedTeam) {
    return res.status(httpStatus.NOT_FOUND).send(
      response({
        status: "Error",
        statusCode: httpStatus.NOT_FOUND,
        message: "Team not found",
        error: "Team with the provided ID does not exist",
      })
    );
  }
  res.status(httpStatus.OK).send(
    response({
      status: "OK",
      statusCode: httpStatus.OK,
      message: "Team updated successfully",
      data: updatedTeam,
    })
  );
});

// Delete a team by ID
const deleteTeamById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const deletedTeam = await teamService.deleteTeamById(id);
  if (!deletedTeam) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Team not found");
  }
  res.status(httpStatus.OK).send(
    response({
      status: "OK",
      statusCode: httpStatus.NO_CONTENT,
      message: "Team deleted successfully",
      data: { deletedTeam },
    })
  );
});

const getAboutMeShowTeam = catchAsync(async (req, res) => {
  const team = await teamService.getAboutMeShowTeam();

   const scheduleList = await scheduleService.getSchedulesByUserId(team._id);

  res.status(httpStatus.OK).send(
    response({
      status: "OK",
      statusCode: httpStatus.NO_CONTENT,
      message: "About me get successfully",
      data: {team, scheduleList},
    })
  );
});

module.exports = {
  createTeam,
  getAllTeams,
  getTeamById,
  updateTeamById,
  deleteTeamById,
  addDegrees,
  addExperience,
  addAchievements,
  deleteDegrees,
  deleteExperience,
  deleteAchievements,
  getAboutMeShowTeam,
};
