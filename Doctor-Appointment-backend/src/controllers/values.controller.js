const httpStatus = require("http-status");
const pick = require("../utils/pick");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const response = require("../config/response");
const { valuesService } = require("../services");

const valueCreate = catchAsync(async (req, res) => {
  if (req.file) {
    req.body.icon = "/uploads/other/" + req.file.filename;
  }
  const value = await valuesService.createValue(req.body);

  res.status(httpStatus.CREATED).json(
    response({
      message: "Value Created",
      status: "OK",
      statusCode: httpStatus.CREATED,
      data: value,
    })
  );
});

const valueGetById = catchAsync(async (req, res) => {
  const value = await valuesService.getValueById(req.params.id);
  res.status(httpStatus.OK).json(
    response({
      message: "Value Retrieved",
      status: "OK",
      statusCode: httpStatus.OK,
      data: value,
    })
  );
});

const valueUpdateById = catchAsync(async (req, res) => {
  if (req.file) {
    req.body.icon = "/uploads/other/" + req.file.filename;
  }
  const value = await valuesService.updateValueById(req.params.id, req.body);
  res.status(httpStatus.OK).json(
    response({
      message: "Value Updated",
      status: "OK",
      statusCode: httpStatus.OK,
      data: value,
    })
  );
});

const valueDeleteById = catchAsync(async (req, res) => {
  const value = await valuesService.deleteValueById(req.params.id);
  res.status(httpStatus.OK).json(
    response({
      message: "Value Deleted",
      status: "OK",
      statusCode: httpStatus.OK,
      data: value,
    })
  );
});

const valueList = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["name", "description", "icon"]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const result = await valuesService.queryValues(filter, options);
  res.status(httpStatus.OK).json(
    response({
      message: "Values Retrieved",
      status: "OK",
      statusCode: httpStatus.OK,
      data: result,
    })
  );
});

module.exports = {
  valueCreate,
  valueGetById,
  valueUpdateById,
  valueDeleteById,
  valueList,
};
