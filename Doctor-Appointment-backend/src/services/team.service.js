const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const { Team } = require("../models");

const createTeam = async (teamData) => {
  const team = await Team.create(teamData);
  return team;
};

const getTeamById = async (id) => {
  const team = await Team.findById(id).populate(
    "createdBy",
    "fullName email profileImage"
  );
  if (!team) throw new ApiError(httpStatus.NOT_FOUND, "Team not found");
  return team;
};

const updateTeamById = async (id, updateData) => {
  const team = await Team.findByIdAndUpdate(id, updateData, {
    new: true,
  }).populate("createdBy", "fullName email profileImage");
  if (!team) throw new ApiError(httpStatus.NOT_FOUND, "Team not found");
  return team;
};

const addDegrees = async (id, degrees) => {
  const team = await Team.findById(id);
  if (!team) throw new ApiError(httpStatus.NOT_FOUND, "Team not found");

  if (!Array.isArray(degrees)) degrees = [degrees];
  team.degrees.push(...degrees);

  await team.save();
  return team;
};

const deleteDegreeById = async (teamId, degreeId) => {
  const team = await Team.findById(teamId);
  if (!team) throw new ApiError(httpStatus.NOT_FOUND, "Team not found");

  const originalLength = team.degrees.length;

  team.degrees = team.degrees.filter(
    (degree) => degree._id.toString() !== degreeId
  );

  if (team.degrees.length === originalLength) {
    throw new ApiError(httpStatus.NOT_FOUND, "Degree not found in team member");
  }

  await team.save();
  return team;
};

const addExperience = async (teamId, experiences) => {
  const team = await Team.findById(teamId);
  if (!team) throw new ApiError(httpStatus.NOT_FOUND, "Team not found");

  if (!Array.isArray(experiences)) experiences = [experiences];
  team.experience.push(...experiences);

  await team.save();
  return team;
};

const deleteExperienceById = async (teamId, experienceId) => {
  const team = await Team.findById(teamId);
  if (!team) throw new ApiError(httpStatus.NOT_FOUND, "Team not found");

  const originalLength = team.experience.length;

  team.experience = team.experience.filter(
    (exp) => exp._id.toString() !== experienceId
  );

  if (team.experience.length === originalLength) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Experience not found in team member"
    );
  }

  await team.save();
  return team;
};

const addAchievements = async (teamId, achievements) => {
  const team = await Team.findById(teamId);
  if (!team) throw new ApiError(httpStatus.NOT_FOUND, "Team not found");

  if (!Array.isArray(achievements)) achievements = [achievements];
  team.achievements.push(...achievements);

  await team.save();
  return team;
};

const deleteAchievementById = async (teamId, achievementId) => {
  const team = await Team.findById(teamId);
  if (!team) throw new ApiError(httpStatus.NOT_FOUND, "Team not found");

  const originalLength = team.achievements.length;

  team.achievements = team.achievements.filter(
    (ach) => ach._id.toString() !== achievementId
  );

  if (team.achievements.length === originalLength) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Achievement not found in team member"
    );
  }

  await team.save();
  return team;
};

const deleteTeamById = async (id) => {
  const team = await Team.findById(id);
  if (!team) throw new ApiError(httpStatus.NOT_FOUND, "Team not found");
  team.isDeleted = true;
  await team.save();
  return team;
};

const queryTeams = async (filter, options) => {
  const query = { isDeleted: false };

  for (const key of Object.keys(filter)) {
    if (
      (key === "fullName" ||
        key === "email" ||
        key === "designation" ||
        key === "phone" ||
        key === "specialties") &&
      filter[key] !== ""
    ) {
      query[key] = { $regex: filter[key], $options: "i" };
    } else if (filter[key] !== "") {
      query[key] = filter[key];
    }
  }

  const users = await Team.paginate(query, options);

  return users;
};

const getAboutMeShowTeam = async () => {
  const teams = await Team.findOne({
    isAdmin: true,
    isDeleted: false,
  }).populate("createdBy", "fullName email profileImage");
  return teams;
};

module.exports = {
  createTeam,
  getTeamById,
  updateTeamById,
  deleteTeamById,
  queryTeams,
  addDegrees,
  deleteDegreeById,
  addExperience,
  deleteExperienceById,
  addAchievements,
  deleteAchievementById,
  getAboutMeShowTeam,
};
