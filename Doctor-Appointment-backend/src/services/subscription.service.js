const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const { Subscription } = require("../models");

// Create a new subscription
const createSubscription = async (subscriptionData) => {
  try {
    const subscription = await Subscription.create(subscriptionData);
    return subscription;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error.message);
  }
};

// Get subscription by ID
const getSubscriptionById = async (id) => {
  try {
    const subscription = await Subscription.findById(id);
    if (!subscription) {
      throw new ApiError(httpStatus.NOT_FOUND, "Subscription not found");
    }
    return subscription;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error.message);
  }
};

// Update subscription by ID
const updateSubscriptionById = async (id, updateData) => {
  try {
    const subscription = await Subscription.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    if (!subscription) {
      throw new ApiError(httpStatus.NOT_FOUND, "Subscription not found");
    }
    return subscription;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error.message);
  }
};

// Delete subscription by ID
const deleteSubscriptionById = async (id) => {
  try {
    const subscription = await Subscription.findById(id);
    if (!subscription) {
      throw new ApiError(httpStatus.NOT_FOUND, "Subscription not found");
    }
    subscription.isDeleted = true;
    await subscription.save();

    return subscription;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error.message);
  }
};

// Get all subscriptions
const getAllSubscriptions = async () => {
  try {
    const subscriptions = await Subscription.find({isDeleted: false});
    return subscriptions;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error.message);
  }
};

module.exports = {
  createSubscription,
  getSubscriptionById,
  updateSubscriptionById,
  deleteSubscriptionById,
  getAllSubscriptions,
};
