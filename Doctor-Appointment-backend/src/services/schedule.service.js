const httpStatus = require("http-status");
const { Schedule } = require("../models");
const ApiError = require("../utils/ApiError");
const mongoose = require("mongoose");

// Create a new schedule
const createSchedule = async (scheduleData) => {
  const schedule = await Schedule.create(scheduleData);
  return schedule;
};

// Get schedule by ID
const getScheduleById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid Schedule ID");
  }

  const schedule = await Schedule.findById(id);

  if (!schedule) {
    throw new ApiError(httpStatus.NOT_FOUND, "Schedule not found");
  }

  return schedule;
};

// Update schedule by ID
const updateScheduleById = async (id, updateData) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid Schedule ID");
  }

  const schedule = await Schedule.findById(id);

  if (!schedule) {
    throw new ApiError(httpStatus.NOT_FOUND, "Schedule not found");
  }

  Object.assign(schedule, updateData);
  await schedule.save();
  return schedule;
};

// Soft delete schedule (mark as 'canceled')
const deleteScheduleById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid Schedule ID");
  }

  const schedule = await Schedule.findById(id);

  if (!schedule) {
    throw new ApiError(httpStatus.NOT_FOUND, "Schedule not found");
  }

  schedule.status = "canceled"; // or 'expired', depending on logic
  await schedule.save();
  return schedule;
};

// Query/paginate schedules
const querySchedules = async (filter = {}, options = {}) => {
  const query = { ...filter };
  const schedules = await Schedule.paginate ? Schedule.paginate(query, options) : Schedule.find(query);
  return schedules;
};


const getSchedulesByUserId = async (userId) => {
  const query = { userId: userId };
  const schedules = await Schedule.find(query).populate("userId", "fullName email profileImage");
  return schedules;
};

module.exports = {
  createSchedule,
  getScheduleById,
  updateScheduleById,
  deleteScheduleById,
  querySchedules,
  getSchedulesByUserId
};
