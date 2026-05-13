const httpStatus = require("http-status");
const { Values } = require("../models");
const ApiError = require("../utils/ApiError");
const mongoose = require("mongoose");

const createValue = async (valueBody) => {
  const existingValue = await Values.findOne({ name: valueBody.name });
  if (existingValue) {
    throw new ApiError(httpStatus.BAD_REQUEST, "The value name already exists.");
  }
  const value = await Values.create({ ...valueBody });
  return value;
};

const getValueById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid Value ID");
  }

  const value = await Values.findOne({ _id: id, isDeleted: false });

  if (!value) {
    throw new ApiError(httpStatus.NOT_FOUND, "Value not found");
  }

  return value;
};

const updateValueById = async (valueId, updateBody) => {
  if (!mongoose.Types.ObjectId.isValid(valueId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid Value ID");
  }

  const value = await Values.findById(valueId);

  if (!value || value.isDeleted) {
    throw new ApiError(httpStatus.NOT_FOUND, "Value not found");
  }

  Object.assign(value, updateBody);
  await value.save();
  return value;
};

const deleteValueById = async (valueId) => {
  if (!mongoose.Types.ObjectId.isValid(valueId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid Value ID");
  }

  const value = await Values.findById(valueId);

  if (!value || value.isDeleted) {
    throw new ApiError(httpStatus.NOT_FOUND, "Value not found");
  }

  value.isDeleted = true;
  await value.save();
  return value;
};

const queryValues = async (filter, options) => {
  const values = await Values.paginate({ ...filter, isDeleted: false }, options);
  return values;
};

module.exports = {
  createValue,
  getValueById,
  updateValueById,
  deleteValueById,
  queryValues,
};
