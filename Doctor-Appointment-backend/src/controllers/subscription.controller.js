const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const response = require("../config/response");
const { subscriptionService } = require("../services");
const ApiError = require("../utils/ApiError");

// Create a new subscription
const createSubscription = catchAsync(async (req, res) => {
  const { limitation } = req.body;
  req.body.createdBy = req.user.id;
  req.body.createdBy = req.user.id;
  if (limitation === "annual") {
    req.body.days = 365;
  }
  if (limitation === "monthly") {
    req.body.days = 30;
  }
  if (limitation === "weekly") {
    req.body.days = 7;
  }
  const newSubscription = await subscriptionService.createSubscription(
    req.body
  );
  res.status(httpStatus.CREATED).send(
    response({
      status: "OK",
      statusCode: httpStatus.CREATED,
      message: "Subscription created successfully",
      data: newSubscription,
    })
  );
});

// Get all subscriptions
const getAllSubscriptions = catchAsync(async (req, res) => {
  const subscriptions = await subscriptionService.getAllSubscriptions();
  res.status(httpStatus.OK).send(
    response({
      status: "OK",
      statusCode: httpStatus.OK,
      message: "Subscriptions retrieved successfully",
      data: subscriptions,
    })
  );
});

// Get a single subscription by ID
const getSubscriptionById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const subscription = await subscriptionService.getSubscriptionById(id);
  if (!subscription) {
    return res.status(httpStatus.NOT_FOUND).send(
      response({
        status: "Error",
        statusCode: httpStatus.NOT_FOUND,
        message: "Subscription not found",
        error: "Subscription with the provided ID does not exist",
      })
    );
  }
  res.status(httpStatus.OK).send(
    response({
      status: "OK",
      statusCode: httpStatus.OK,
      message: "Subscription retrieved successfully",
      data: subscription,
    })
  );
});

// Update a subscription by ID
const updateSubscriptionById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const updatedSubscription = await subscriptionService.updateSubscriptionById(
    id,
    updateData
  );
  if (!updatedSubscription) {
    return res.status(httpStatus.NOT_FOUND).send(
      response({
        status: "Error",
        statusCode: httpStatus.NOT_FOUND,
        message: "Subscription not found",
        error: "Subscription with the provided ID does not exist",
      })
    );
  }
  res.status(httpStatus.OK).send(
    response({
      status: "OK",
      statusCode: httpStatus.OK,
      message: "Subscription updated successfully",
      data: updatedSubscription,
    })
  );
});

// Delete a subscription by ID
const deleteSubscriptionById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const deletedSubscription = await subscriptionService.deleteSubscriptionById(
    id
  );
  if (!deletedSubscription) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Not found")
  }
  res.status(httpStatus.OK).send(
    response({
      status: "OK",
      statusCode: httpStatus.NO_CONTENT,
      message: "Subscription deleted successfully",
      data: { deletedSubscription }
    })
  );
});

module.exports = {
  createSubscription,
  getAllSubscriptions,
  getSubscriptionById,
  updateSubscriptionById,
  deleteSubscriptionById,
};
