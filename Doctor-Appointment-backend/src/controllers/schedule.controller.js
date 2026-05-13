const httpStatus = require("http-status");
const pick = require("../utils/pick");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const response = require("../config/response");
const { scheduleService } = require("../services");

// Create a schedule
const scheduleCreate = catchAsync(async (req, res) => {
  const schedule = await scheduleService.createSchedule(req.body);
  res.status(httpStatus.CREATED).json(
    response({
      message: "Schedule Added",
      status: "OK",
      statusCode: httpStatus.CREATED,
      data: schedule,
    })
  );
});

// Get schedule by ID
const scheduleGetById = catchAsync(async (req, res) => {
  const schedule = await scheduleService.getScheduleById(req.params.id);
  res.status(httpStatus.OK).json(
    response({
      message: "Schedule Retrieved",
      status: "OK",
      statusCode: httpStatus.OK,
      data: schedule,
    })
  );
});

// Update schedule by ID
const scheduleUpdateById = catchAsync(async (req, res) => {
  const schedule = await scheduleService.updateScheduleById(req.params.id, req.body);
  res.status(httpStatus.OK).json(
    response({
      message: "Schedule Updated",
      status: "OK",
      statusCode: httpStatus.OK,
      data: schedule,
    })
  );
});

// Delete (soft delete) schedule by ID
const scheduleDeleteById = catchAsync(async (req, res) => {
  const schedule = await scheduleService.deleteScheduleById(req.params.id);
  res.status(httpStatus.OK).json(
    response({
      message: "Schedule Canceled",
      status: "OK",
      statusCode: httpStatus.OK,
      data: schedule,
    })
  );
});

// List schedules with filters and pagination
const scheduleList = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["userId", "type", "status"]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const result = await scheduleService.querySchedules(filter, options);
  res.status(httpStatus.OK).json(
    response({
      message: "Schedules Retrieved",
      status: "OK",
      statusCode: httpStatus.OK,
      data: result,
    })
  );
});


const getSchedulesByUserId = catchAsync(async (req, res) => {
  const userId = req.params.userId;
  const result = await scheduleService.getSchedulesByUserId(userId);
  res.status(httpStatus.OK).json(
    response({
      message: "Schedules Retrieved",
      status: "OK",
      statusCode: httpStatus.OK,
      data: result,
    })
  );
});

module.exports = {
  scheduleCreate,
  scheduleGetById,
  scheduleUpdateById,
  scheduleDeleteById,
  scheduleList,
  getSchedulesByUserId
};
