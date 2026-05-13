const httpStatus = require("http-status");
const pick = require("../utils/pick");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const response = require("../config/response");
const {
  adminService,
  userService,
  appointmentService,
  transactionService,
} = require("../services");
const unlinkImages = require("../common/unlinkImage");

const getTotalStatus = catchAsync(async (req, res, next) => {
  const result = await adminService.getTotalStatus();
  res.status(httpStatus.OK).json(
    response({
      message: "Total Status Retrieved successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: result,
    })
  );
});

const getIncomeRatio = catchAsync(async (req, res, next) => {
  const { year, status } = pick(req.query, ["year", "status"]);
  if (!year) {
    return res.status(httpStatus.BAD_REQUEST).json(
      response({
        message: "Year query parameter is required",
        status: "BAD_REQUEST",
        statusCode: httpStatus.BAD_REQUEST,
        data: null,
      })
    );
  }

  const result = await adminService.getIncomeRatio(year, status);
  res.status(httpStatus.OK).json(
    response({
      message: "Income Ratio Retrieved successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: result,
    })
  );
});

const getUserRatio = catchAsync(async (req, res, next) => {
  const { year } = pick(req.query, ["year"]);
  if (!year) {
    return res.status(httpStatus.BAD_REQUEST).json(
      response({
        message: "Year query parameter is required",
        status: "BAD_REQUEST",
        statusCode: httpStatus.BAD_REQUEST,
        data: null,
      })
    );
  }

  const result = await adminService.getUserRatio(year);
  res.status(httpStatus.OK).json(
    response({
      message: "User Ratio Retrieved successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: result,
    })
  );
});

const getResentUser = catchAsync(async (req, res, next) => {
  const { limit = 10, page = 1, fullName, email } = req.query;

  const parsedLimit = parseInt(limit, 10) || 10;
  const parsedPage = parseInt(page, 10) || 1;

  const filter = {};
  if (fullName) filter["fullName"] = { $regex: fullName, $options: "i" };
  if (email) filter["email"] = { $regex: email, $options: "i" };

  const { recentUser, totalDocuments } = await adminService.getResentUser({
    limit: parsedLimit,
    page: parsedPage,
    filter,
  });

  res.status(httpStatus.OK).json({
    message: "Recent Appointments Retrieved Successfully",
    status: "OK",
    statusCode: httpStatus.OK,
    data: recentUser,
    limit: parsedLimit,
    page: parsedPage,
    totalDocuments,
  });
});

const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, [
    "fullName",
    "email",
    "userName",
    "gender",
    "address",
    "isEmailVerified",
    "isProfileCompleted",
    "isDeleted",
    "isBlocked",
    "createdAt",
  ]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const result = await adminService.queryUsers(filter, options);
  res.status(httpStatus.OK).json(
    response({
      message: "All Users",
      status: "OK",
      statusCode: httpStatus.OK,
      data: result,
    })
  );
});

const getUsersDetails = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);

  const allAppointment = await appointmentService.getAppointmentByBookerId(
    req.params.userId
  );

  res.status(httpStatus.OK).json(
    response({
      message: "User Details Retrieved Successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: { user, allAppointment },
    })
  );
});

const getAllTransactions = catchAsync(async (req, res) => {
  const filter = pick(req.query, [
    "stripePriceId",
    "checkoutSessionId",
    "mode",
    "status",
    "createdAt",
  ]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const transactions = await transactionService.queryTransactions(filter, options);

  res.status(httpStatus.OK).json(
    response({
      message: "All Transactions Retrieved Successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: transactions,
    })
  );
});


const getTransactionDetails = catchAsync(async (req, res) => {
  const transactionId = req.params.transactionId;

  if (!transactionId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Transaction ID is required");
  }

  const transaction = await transactionService.getTransactionById(transactionId);

  if (!transaction) {
    throw new ApiError(httpStatus.NOT_FOUND, "Transaction not found");
  }

  res.status(httpStatus.OK).json(
    response({
      message: "Transaction Details Retrieved Successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: transaction,
    })
  );
})

const getBlockUser = catchAsync(async (req, res, next) => {
  const { limit = 10, page = 1, fullName, email } = req.query;

  const parsedLimit = parseInt(limit, 10) || 10;
  const parsedPage = parseInt(page, 10) || 1;

  const filter = {};
  if (fullName) filter["fullName"] = { $regex: fullName, $options: "i" };
  if (email) filter["email"] = { $regex: email, $options: "i" };

  const { recentUser, totalDocuments } = await adminService.getBlockUser({
    limit: parsedLimit,
    page: parsedPage,
    filter,
  });

  res.status(httpStatus.OK).json({
    message: "All block Retrieved Successfully",
    status: "OK",
    statusCode: httpStatus.OK,
    data: recentUser,
    limit: parsedLimit,
    page: parsedPage,
    totalDocuments,
  });
});

const blockUser = catchAsync(async (req, res, next) => {
  const { userId } = req.query;

  if (!userId) {
    throw new ApiError("User Id is required");
  }

  const user = await adminService.blockUser(userId);

  res.status(httpStatus.OK).json({
    message: "Block User",
    status: "Ok",
    statusCode: httpStatus.OK,
    data: user,
  });
});

const unBlockUser = catchAsync(async (req, res, next) => {
  const { userId } = req.query;

  if (!userId) {
    throw new ApiError("User Id is required");
  }

  const user = await adminService.unBlockUser(userId);

  res.status(httpStatus.OK).json({
    message: "Block User",
    status: "Ok",
    statusCode: httpStatus.OK,
    data: user,
  });
});

const queryTransactions = catchAsync(async (req, res) => {
  const filter = {
    fullName: req.query.fullName || "",
    timestamp: req.query.date || "",
    transactionId: req.query.transactionId || "",
    infoType: req.query.infoType || "",
    status: req.query.status || "",
  };
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const result = await adminService.queryTransactions(filter, options);

  res.status(httpStatus.OK).json({
    message: "All Recent Transactions",
    status: "OK",
    statusCode: httpStatus.OK,
    data: result,
  });
});

const getSingleProvider = catchAsync(async (req, res) => {
  const providerId = req.params.providerId;
  const result = await adminService.getSingleProvider(providerId);

  res.status(httpStatus.OK).json({
    message: "Single Provider fetched successfully",
    status: "OK",
    statusCode: httpStatus.OK,
    data: result,
  });
});

const agtAllBids = catchAsync(async (req, res) => {
  const { date, fullName, page = 1, limit = 10 } = req.query;
  const result = await adminService.getAllBid(
    date,
    fullName,
    parseInt(page),
    parseInt(limit)
  );

  res.status(httpStatus.OK).json({
    message: "All Bids fetched successfully",
    status: "OK",
    statusCode: httpStatus.OK,
    data: result,
  });
});

module.exports = {
  getTotalStatus,
  getUserRatio,
  getIncomeRatio,
  getUsers,
  getResentUser,
  queryTransactions,
  getBlockUser,
  blockUser,
  unBlockUser,
  getSingleProvider,
  agtAllBids,
  getUsersDetails,
  getAllTransactions,
  getTransactionDetails
};
