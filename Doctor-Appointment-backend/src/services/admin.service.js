const { User, Transaction, Appointment } = require("../models");
const ApiError = require("../utils/ApiError");
const userService = require("./user.service");
const appointmentService = require("./appointment.service");

const getTotalStatus = async () => {
  const userAggregation = [
    {
      $facet: {
        totalUser: [
          { $match: { role: "user", isDeleted: false, isEmailVerified: true } }, // isBlocked: false,
          { $count: "count" },
        ],
        totalBlockedUser: [
          { $match: { role: "user" } }, // isBlocked: true
          { $count: "count" },
        ],
        totalUnverifiedUser: [
          { $match: { role: "user", isEmailVerified: false } },
          { $count: "count" },
        ],
        totalDeletedUser: [
          { $match: { role: "user", isDeleted: true } },
          { $count: "count" },
        ],
      },
    },
    {
      $project: {
        totalUser: { $arrayElemAt: ["$totalUser.count", 0] },
        totalBlockedUser: { $arrayElemAt: ["$totalBlockedUser.count", 0] },
        totalUnverifiedUser: {
          $arrayElemAt: ["$totalUnverifiedUser.count", 0],
        },
        totalDeletedUser: { $arrayElemAt: ["$totalDeletedUser.count", 0] },
      },
    },
  ];

  const userResult = await User.aggregate(userAggregation);

  const totalUser = userResult[0]?.totalUser || 0;
  const totalBlockedUser = userResult[0]?.totalBlockedUser || 0;
  const totalUnverifiedUser = userResult[0]?.totalUnverifiedUser || 0;
  const totalDeletedUser = userResult[0]?.totalDeletedUser || 0;

  const paymentAggregation = [
    {
      $match: {
        status: { $in: ["panding", "completed", "canceled"] },
      },
    },
    {
      $group: {
        _id: "$status",
        totalAmount: { $sum: "$amount" },
      },
    },
  ];

  const paymentResult = await Transaction.aggregate(paymentAggregation);

  let pendingEarnings = 0;
  let completedEarnings = 0;
  let canceledEarnings = 0;

  paymentResult.forEach((result) => {
    if (result._id === "panding") {
      pendingEarnings = result.totalAmount;
    } else if (result._id === "completed") {
      completedEarnings = result.totalAmount;
    } else if (result._id === "canceled") {
      canceledEarnings = result.totalAmount;
    }
  });

  const appointmentAggregation = [
    {
      $facet: {
        totalAppointments: [
          { $match: { isDeleted: false } },
          { $count: "count" },
        ],
        pendingAppointments: [
          { $match: { status: "pending", isDeleted: false } },
          { $count: "count" },
        ],
        confirmedAppointments: [
          { $match: { status: "confirmed", isDeleted: false } },
          { $count: "count" },
        ],
        cancelledAppointments: [
          { $match: { status: "cancelled", isDeleted: false } },
          { $count: "count" },
        ],
        completedAppointments: [
          { $match: { status: "completed", isDeleted: false } },
          { $count: "count" },
        ],
        noShowAppointments: [
          { $match: { status: "no_show", isDeleted: false } },
          { $count: "count" },
        ],
      },
    },
    {
      $project: {
        totalAppointments: { $arrayElemAt: ["$totalAppointments.count", 0] },
        pendingAppointments: {
          $arrayElemAt: ["$pendingAppointments.count", 0],
        },
        confirmedAppointments: {
          $arrayElemAt: ["$confirmedAppointments.count", 0],
        },
        cancelledAppointments: {
          $arrayElemAt: ["$cancelledAppointments.count", 0],
        },
        completedAppointments: {
          $arrayElemAt: ["$completedAppointments.count", 0],
        },
        noShowAppointments: { $arrayElemAt: ["$noShowAppointments.count", 0] },
      },
    },
  ];

  const appointmentResult = await Appointment.aggregate(appointmentAggregation);

  return {
    earnings: {
      pendingEarnings,
      completedEarnings,
      canceledEarnings,
    },
    user: {
      totalUser,
      totalBlockedUser,
      totalUnverifiedUser,
      totalDeletedUser,
    },
    appointment: {
      totalAppointments: appointmentResult[0]?.totalAppointments || 0,
      pendingAppointments: appointmentResult[0]?.pendingAppointments || 0,
      confirmedAppointments: appointmentResult[0]?.confirmedAppointments || 0,
      cancelledAppointments: appointmentResult[0]?.cancelledAppointments || 0,
      completedAppointments: appointmentResult[0]?.completedAppointments || 0,
      noShowAppointments: appointmentResult[0]?.noShowAppointments || 0,
    },
  };
};

const getIncomeRatio = async (year, status = "completed") => {
  const payments = await Transaction.aggregate([
    {
      $match: {
        status: status, // Filter by the provided status (e.g., 'completed', 'panding', or 'canceled')
        createdAt: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
        totalEarnings: { $sum: "$amount" },
      },
    },
    {
      $sort: { "_id.year": 1, "_id.month": 1 },
    },
    {
      $project: {
        _id: 0,
        month: "$_id.month",
        totalEarnings: 1,
      },
    },
  ]);

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sept",
    "Oct",
    "Nov",
    "Dec",
  ];

  const monthlyIncomeRatio = monthNames.map((month) => ({
    month,
    totalEarnings: 0,
  }));

  payments.forEach((payment) => {
    monthlyIncomeRatio[payment.month - 1].totalEarnings = payment.totalEarnings;
  });

  return {
    status,
    year,
    monthlyIncomeRatio,
  };
};

const getUserRatio = async (year) => {
  const userAggregation = [
    {
      $match: {
        createdAt: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
        totalUsers: { $sum: 1 },
      },
    },
    {
      $sort: { "_id.year": 1, "_id.month": 1 },
    },
    {
      $project: {
        _id: 0,
        month: "$_id.month",
        totalUsers: 1,
      },
    },
  ];

  const userResult = await User.aggregate(userAggregation);

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sept",
    "Oct",
    "Nov",
    "Dec",
  ];

  const monthlyUserCount = monthNames.map((month) => ({
    month,
    totalUsers: 0,
  }));

  userResult.forEach((userData) => {
    monthlyUserCount[userData.month - 1].totalUsers = userData.totalUsers;
  });

  return {
    year,
    monthlyUserCount,
  };
};

const getResentUser = async ({ limit = 10, page = 1, filter = {} }) => {
  try {
    const skip = (page - 1) * limit;

    const queryConditions = { isBlock: false, role: "user" };
    if (filter.fullName) {
      queryConditions.fullName = new RegExp(
        filter.fullName.$regex,
        filter.fullName.$options
      );
    }
    if (filter.email) {
      queryConditions.email = new RegExp(
        filter.email.$regex,
        filter.email.$options
      );
    }

    const totalDocuments = await User.countDocuments(queryConditions);

    const recentUser = await User.find(queryConditions)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    return { recentUser: recentUser, totalDocuments };
  } catch (error) {
    console.error("Error fetching recent users:", error);
    throw new Error("Failed to fetch recent users");
  }
};

const queryUsers = async (filter, options) => {
  const query = { role: "user" };

  for (const key of Object.keys(filter)) {
    if (
      (key === "fullName" ||
        key === "email" ||
        key === "userName" ||
        key === "gender" ||
        key === "address") &&
      filter[key] !== ""
    ) {
      query[key] = { $regex: filter[key], $options: "i" };
    } else if (
      (key === "isEmailVerified" ||
        key === "isProfileCompleted" ||
        key === "isDeleted" ||
        key === "isBlocked") &&
      filter[key] === undefined
    ) {
      query[key] = false;
    } else if (key === "createdAt" && filter[key]) {
      const dateFilter = filter[key];

      const date = new Date(dateFilter);

      if (!isNaN(date)) {
        query.createdAt = {
          $gte: new Date(date.setHours(0, 0, 0, 0)),
          $lte: new Date(date.setHours(23, 59, 59, 999)),
        };
      } else {
        throw new Error("Invalid date format for 'createdAt'.");
      }
    }
  }

  const users = await User.paginate(query, options);

  return users;
};

const toggleUserBlock = async (userId, shouldBlock) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError("User not found.");
  }

  if (user.isBlock === shouldBlock) {
    throw new ApiError(
      shouldBlock ? "User is already blocked." : "User is already unblocked."
    );
  }

  user.isBlock = shouldBlock;
  const updatedUser = await user.save();

  return updatedUser;
};

const blockUser = async (userId) => {
  return toggleUserBlock(userId, true);
};

const unBlockUser = async (userId) => {
  return toggleUserBlock(userId, false);
};

const getBlockUser = async ({ limit = 10, page = 1, filter = {} }) => {
  try {
    const skip = (page - 1) * limit;

    const queryConditions = { isBlock: true, role: "user" };
    if (filter.fullName) {
      queryConditions.fullName = new RegExp(
        filter.fullName.$regex,
        filter.fullName.$options
      );
    }
    if (filter.email) {
      queryConditions.email = new RegExp(
        filter.email.$regex,
        filter.email.$options
      );
    }

    const totalDocuments = await User.countDocuments(queryConditions);

    const recentUser = await User.find(queryConditions)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    return { recentUser: recentUser, totalDocuments };
  } catch (error) {
    console.error("Error fetching recent users:", error);
    throw new Error("Failed to fetch recent users");
  }
};

const queryTransactions = async (filter, options) => {
  const matchStage = {};

  if (filter.fullName && filter.fullName !== "") {
    const users = await User.find({
      fullName: { $regex: filter.fullName, $options: "i" },
    }).select("_id");

    const userIds = users.map((user) => user._id);
    matchStage.userId = { $in: userIds };
  }

  if (filter.infoType && filter.infoType !== "") {
    matchStage["transactions.infoType"] = filter.infoType;
  }

  if (filter.status && filter.status !== "") {
    matchStage["transactions.status"] = filter.status;
  }

  if (filter.timestamp) {
    const date = new Date(filter.timestamp);
    const nextDay = new Date(date);
    nextDay.setDate(date.getDate() + 1);

    matchStage["transactions.timestamp"] = {
      $gte: date,
      $lt: nextDay,
    };
  }

  if (filter.transactionId && filter.transactionId !== "") {
    matchStage["transactions.transactionId"] = filter.transactionId;
  }

  for (const key of Object.keys(filter)) {
    if (
      filter[key] !== "" &&
      key !== "fullName" &&
      key !== "infoType" &&
      key !== "timestamp" &&
      key !== "transactionId"
    ) {
      matchStage[key] = filter[key];
    }
  }

  const page = parseInt(options.page, 10) || 1;
  const limit = parseInt(options.limit, 10) || 10;

  const pipeline = [
    { $unwind: "$transactions" },
    { $match: matchStage },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "userDetails",
      },
    },
    { $unwind: "$userDetails" },
    {
      $project: {
        _id: 0,
        transactionId: "$transactions.transactionId",
        infoType: "$transactions.infoType",
        amount: "$transactions.amount",
        status: "$transactions.status",
        timestamp: "$transactions.timestamp",
        description: "$transactions.description",
        userId: 1,
        "userDetails.fullName": 1,
        "userDetails.email": 1,
        "userDetails.role": 1,
        "userDetails.gender": 1,
        "userDetails.image": 1,
      },
    },
    { $sort: { timestamp: -1 } },
    { $skip: (page - 1) * limit },
    { $limit: limit },
  ];

  const payments = await Wallet.aggregate(pipeline);

  return payments;
};

const getSingleProvider = async (id) => {
  const provider = await User.findOne({
    _id: id,
    isDeleted: false,
    isBlock: false,
  });
  if (!provider) {
    throw new Error("Provider not found");
  }
  const providerProduct = await Product.find({ createdBy: id });
  // if (providerProduct.length === 0) {
  //     throw new Error("No products found for the provider");
  // }
  const categoryIds = providerProduct.map((product) => product.category);

  const providerCategory = await Category.find({ _id: { $in: categoryIds } });

  const providerReview = await Review.find({ reviewee: id }).populate(
    "reviewer"
  );

  return { provider, providerCategory, providerReview };
};

const getAllBid = async (date, fullName, page = 1, limit = 10) => {
  try {
    const query = {};

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);

      query.updatedAt = { $gte: startDate, $lt: endDate };
    }

    const skip = (page - 1) * limit;

    const [bids, totalResults] = await Promise.all([
      Bid.find(query)
        .populate({
          path: "user",
          match: fullName ? { fullName: new RegExp(fullName, "i") } : {},
        })
        .skip(skip)
        .limit(limit),
      Bid.countDocuments(query),
    ]);

    const filteredBids = fullName ? bids.filter((bid) => bid.user) : bids;

    const finalTotalResults = fullName ? filteredBids.length : totalResults;

    return {
      bids: filteredBids,
      page,
      limit,
      totalPages: Math.ceil(finalTotalResults / limit),
      totalResults: finalTotalResults,
    };
  } catch (error) {
    console.error("Error fetching bids:", error.message);
    throw error;
  }
};

module.exports = {
  getTotalStatus,
  getUserRatio,
  getIncomeRatio,
  queryUsers,
  getResentUser,
  queryTransactions,
  blockUser,
  unBlockUser,
  getBlockUser,
  getSingleProvider,
  getAllBid,
};
