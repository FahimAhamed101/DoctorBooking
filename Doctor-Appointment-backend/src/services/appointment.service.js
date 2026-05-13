const httpStatus = require("http-status");
const mongoose = require("mongoose");
const { Appointment } = require("../models");
const ApiError = require("../utils/ApiError");

const createAppointment = async (appointmentBody) => {
  const appointment = await Appointment.create({ ...appointmentBody });
  return appointment;
};

const getAppointmentById = async (id) => {
  const appointment = await Appointment.findOne({ appointmentId: id })
    .populate({
      path: "booker",
      select: "userName fullName email profileImage callingCode phoneNumber",
    })
    .populate({
      path: "doctor",
      select: "userName fullName email profileImage callingCode phoneNumber",
    });

  if (!appointment) {
    throw new ApiError(httpStatus.NOT_FOUND, "Appointment not found");
  }

  return appointment;
};

const getAppointmentByMainId = async (id) => {
  const appointment = await Appointment.findOne({ _id: id })
    .populate({
      path: "booker",
      select: "userName fullName email profileImage callingCode phoneNumber",
    })
    .populate({
      path: "doctor",
      select: "userName fullName email profileImage callingCode phoneNumber",
    });

  if (!appointment) {
    throw new ApiError(httpStatus.NOT_FOUND, "Appointment not found");
  }

  return appointment;
};

const getAppointmentByBookerId = async (id) => {
  const appointment = await Appointment.find({ booker: id })
    .populate({
      path: "booker",
      select: "userName fullName email profileImage callingCode phoneNumber",
    })
    .populate({
      path: "doctor",
      select: "userName fullName email profileImage callingCode phoneNumber",
    });

  if (!appointment) {
    throw new ApiError(httpStatus.NOT_FOUND, "Appointment not found");
  }

  return appointment;
};

const updateAppointmentById = async (id, updateBody) => {
  const appointment = await getAppointmentById(id);

  if (!appointment) {
    throw new ApiError(httpStatus.NOT_FOUND, "Appointment not found");
  }

  Object.assign(appointment, updateBody);
  await appointment.save();
  return appointment;
};

const deleteAppointmentById = async (id) => {
  const appointment = await getAppointmentById(id);

  if (!appointment) {
    throw new ApiError(httpStatus.NOT_FOUND, "Appointment not found");
  }

  appointment.isDeleted = true;
  await appointment.save();
  return appointment;
};

const queryAppointments = async (filter, options) => {
  const page = parseInt(options.page, 10) || 1;
  const limit = parseInt(options.limit, 10) || 10;

  const query = { isDeleted: false };

  const regexFields = [
    "patientName",
    "patientEmail",
    "patientPhone",
    "patientGender",
    "patientAddress",
    "visitType",
    "department",
    "bodyPart",
    "timeSlot",
    "status",
  ];

  for (const key of Object.keys(filter)) {
    const value = filter[key];

    if (value === "" || value === null || value === undefined) {
      continue;
    }

    if (regexFields.includes(key)) {
      query[key] = { $regex: value, $options: "i" };
    } else if (key === "date") {
      // Handle exact date match (ignoring time)
      const start = new Date(value);
      start.setHours(0, 0, 0, 0);
      const end = new Date(value);
      end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    } else {
      query[key] = value;
    }
  }

  // Use aggregation to populate the booker field and handle pagination
  const aggregatePipeline = [
    { $match: query }, // match the filter criteria

    {
      $lookup: {
        from: "users", // Ensure this matches the actual name of your users collection
        localField: "booker",
        foreignField: "_id",
        as: "booker",
      },
    },
    {
      $unwind: {
        path: "$booker",
        preserveNullAndEmptyArrays: true, // To keep appointments without a booker
      },
    },

    // Optionally, project the fields of `booker` you want
    {
      $project: {
        appointmentId: 1,
        booker: {
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
        doctor: 1,
        patientName: 1,
        patientEmail: 1,
        patientPhone: 1,
        patientAge: 1,
        patientGender: 1,
        patientAddress: 1,
        visitType: 1,
        category: 1,
        specificConditions: 1,
        department: 1,
        bodyPart: 1,
        date: 1,
        timeSlot: 1,
        reason: 1,
        status: 1,
        isPaid: 1,
        paymentDetails: 1,
        isDeleted: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },

    // Add pagination stages
    { $skip: (page - 1) * limit },
    { $limit: limit },
  ];

  // Execute the aggregation pipeline
  const appointments = await Appointment.aggregate(aggregatePipeline);

  // Count the total appointments to handle pagination info
  const totalResults = await Appointment.countDocuments(query);

  return {
    results: appointments,
    page,
    limit,
    totalPages: Math.ceil(totalResults / limit),
    totalResults,
  };
};

const queryAppointmentsForUser = async (filter, options, userId) => {
  const query = { isDeleted: false, booker: userId };

  const regexFields = [
    "patientName",
    "patientEmail",
    "patientPhone",
    "patientGender",
    "patientAddress",
    "visitType",
    "department",
    "bodyPart",
    "timeSlot",
    "status",
  ];

  for (const key of Object.keys(filter)) {
    const value = filter[key];

    if (value === "" || value === null || value === undefined) {
      continue;
    }

    if (regexFields.includes(key)) {
      query[key] = { $regex: value, $options: "i" };
    } else if (key === "date") {
      // Handle exact date match (ignoring time)
      const start = new Date(value);
      start.setHours(0, 0, 0, 0);
      const end = new Date(value);
      end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    } else {
      query[key] = value;
    }
  }

  const appointments = await Appointment.paginate(query, options);
  return appointments;
};

module.exports = {
  createAppointment,
  getAppointmentById,
  updateAppointmentById,
  deleteAppointmentById,
  queryAppointments,
  queryAppointmentsForUser,
  getAppointmentByMainId,
  getAppointmentByBookerId,
};
