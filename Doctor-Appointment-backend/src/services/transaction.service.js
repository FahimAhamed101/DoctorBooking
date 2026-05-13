const httpStatus = require("http-status");
const { Transaction } = require("../models");
const ApiError = require("../utils/ApiError");
const mongoose = require("mongoose");

const createNewTransaction = async (transactionBody) => {
  const transaction = await Transaction.create(transactionBody);
  return transaction;
};

const getTransactionById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid Transaction ID");
  }

  const transaction = await Transaction.findOne({
    _id: id,
    isDeleted: false,
  }).populate("user", "profileImage fullName email callingCode phoneNumber createdAt");

  if (!transaction) {
    throw new ApiError(httpStatus.NOT_FOUND, "Transaction not found");
  }

  return transaction;
};

const getTransactionByStripeSheckoutId = async (id) => {


  const transaction = await Transaction.findOne({
    checkoutSessionId: id,
    isDeleted: false,
  }).populate("user");

  if (!transaction) {
    throw new ApiError(httpStatus.NOT_FOUND, "Transaction not found");
  }

  return transaction;
};

const updateTransactionById = async (transactionId, updateBody) => {
  if (!mongoose.Types.ObjectId.isValid(transactionId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid Transaction ID");
  }

  const transaction = await Transaction.findById(transactionId);

  if (!transaction || transaction.isDeleted) {
    throw new ApiError(httpStatus.NOT_FOUND, "Transaction not found");
  }

  Object.assign(transaction, updateBody);
  await transaction.save();
  return transaction;
};

const updateTransactionByAppointmentId = async (transactionId, updateBody) => {
  const transaction = await Transaction.findOne({
    transactionId,
    isDeleted: false,
  });

  if (!transaction || transaction.isDeleted) {
    throw new ApiError(httpStatus.NOT_FOUND, "Transaction not found");
  }

  Object.assign(transaction, updateBody);
  await transaction.save();
  return transaction;
};


const deleteTransactionById = async (transactionId) => {
  if (!mongoose.Types.ObjectId.isValid(transactionId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid Transaction ID");
  }

  const transaction = await Transaction.findById(transactionId);

  if (!transaction || transaction.isDeleted) {
    throw new ApiError(httpStatus.NOT_FOUND, "Transaction not found");
  }

  transaction.isDeleted = true;
  await transaction.save();
  return transaction;
};



const queryTransactions = async (filter, options) => {
  const page = parseInt(options.page, 10) || 1;
  const limit = parseInt(options.limit, 10) || 10;

  const query = { isDeleted: false };

  const regexFields = [
    "stripePriceId",
    "checkoutSessionId",
    "mode",
    "status",
  ];

  for (const key of Object.keys(filter)) {
    const value = filter[key];

    if (value === "" || value === null || value === undefined) {
      continue;
    }

    if (regexFields.includes(key)) {
      query[key] = { $regex: value, $options: "i" };
    } else if (key === "createdAt") {
      const start = new Date(value);
      start.setHours(0, 0, 0, 0);
      const end = new Date(value);
      end.setHours(23, 59, 59, 999);
      query.createdAt = { $gte: start, $lte: end };
    } else {
      query[key] = value;
    }
  }

  const aggregatePipeline = [
    { $match: query },

    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: {
        path: "$user",
        preserveNullAndEmptyArrays: true,
      },
    },

    {
      $lookup: {
        from: "appointments",
        localField: "appointment",
        foreignField: "_id",
        as: "appointment",
      },
    },
    {
      $unwind: {
        path: "$appointment",
        preserveNullAndEmptyArrays: true, 
      },
    },

    {
      $project: {
        user: {
          _id: 1,
          fullName: 1,
          height: 1,
          weight: 1,
          profileImage: 1,
          callingCode: 1,
          phoneNumber: 1,
          medicalCondition: 1,
          email: 1,
        },
        amount: 1,
        stripePriceId: 1,
        checkoutSessionId: 1,
        mode: 1,
        status: 1,
        isDeleted: 1,
        createdAt: 1,
        updatedAt: 1,

        // Appointment details (you can select specific fields as needed)
        appointmentId: "$appointment.appointmentId",
        appointmentDate: "$appointment.date",
        appointmentTimeSlot: "$appointment.timeSlot",
        appointmentStatus: "$appointment.status",
        doctor: "$appointment.doctor",
        patientName: "$appointment.patientName",
        patientEmail: "$appointment.patientEmail",
        patientPhone: "$appointment.patientPhone",
        patientAge: "$appointment.patientAge",
        patientGender: "$appointment.patientGender",
        patientAddress: "$appointment.patientAddress",
        visitType: "$appointment.visitType",
        category: "$appointment.category",
        specificConditions: "$appointment.specificConditions",
        department: "$appointment.department",
        bodyPart: "$appointment.bodyPart",
        reason: "$appointment.reason",
      },
    },

    { $skip: (page - 1) * limit },
    { $limit: limit },
  ];

  const transactions = await Transaction.aggregate(aggregatePipeline);

  const totalResults = await Transaction.countDocuments(query);

  return {
    results: transactions,
    page,
    limit,
    totalPages: Math.ceil(totalResults / limit),
    totalResults,
  };
};


module.exports = {
  createNewTransaction,
  getTransactionById,
  updateTransactionById,
  updateTransactionByAppointmentId,
  deleteTransactionById,
  queryTransactions,
  getTransactionByStripeSheckoutId,
};
