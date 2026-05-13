const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const {
  PrivacyPolicy,
  TermsAndCondition,
  AboutUs,
  Support,
  Fees,
  Notification,
  ChildSafetyPolicy
} = require("../models");
const he = require("he");

const createPrivacy = async (privacyBody) => {
  if (privacyBody.content) {
    privacyBody.content = he.decode(privacyBody.content);
  }

  const existingPrivacy = await PrivacyPolicy.findOne();
  if (existingPrivacy) {
    existingPrivacy.set(privacyBody);
    await existingPrivacy.save();
    return existingPrivacy;
  } else {
    const newPrivacy = await PrivacyPolicy.create(privacyBody);
    return newPrivacy;
  }
};

const queryPrivacy = async () => {
  const privacy = await PrivacyPolicy.find();
  return privacy;
};

const createTerms = async (termsBody) => {
  if (termsBody.content) {
    termsBody.content = he.decode(termsBody.content);
  }

  const existingTerms = await TermsAndCondition.findOne();
  if (existingTerms) {
    existingTerms.set(termsBody);
    await existingTerms.save();
    return existingTerms;
  } else {
    const newTerms = await TermsAndCondition.create(termsBody);
    return newTerms;
  }
};

const queryTerms = async () => {
  const terms = await TermsAndCondition.find();
  return terms;
};

const createAboutUs = async (body) => {
  if (body.content) {
    body.content = he.decode(body.content);
  }

  const existingAboutUs = await AboutUs.findOne();
  if (existingAboutUs) {
    existingAboutUs.set(body);
    await existingAboutUs.save();
    return existingAboutUs;
  } else {
    const newAboutUs = await AboutUs.create(body);
    return newAboutUs;
  }
};

const queryAboutUs = async () => {
  const newAboutUs = await AboutUs.find();
  return newAboutUs;
};

const createSupport = async (body) => {
  if (body.content) {
    body.content = he.decode(body.content);
  }

  const existingSupport = await Support.findOne();
  if (existingSupport) {
    existingSupport.set(body);
    await existingSupport.save();
    return existingSupport;
  } else {
    const newSupport = await Support.create(body);
    return newSupport;
  }
};

const querySupport = async () => {
  const newSupport = await Support.find();
  return newSupport;
};

const updateFees = async (feesId, updateFees) => {
  const fees = await Fees.findById(feesId);
  Object.assign(fees, updateFees);
  await fees.save();
  return fees;
};

const getFees = async () => {
  const fees = await Fees.find();
  return fees;
};

const gerAllNotifications = async (id) => {
  const notifications = await Notification.find({ userId: id }).sort({
    createdAt: -1,
  });

  const totalUnread = await Notification.countDocuments({
    userId: id,
    status: "unread",
  });
  const totalRead = await Notification.countDocuments({
    userId: id,
    status: "read",
  });

  return {
    notifications,
    totalUnread,
    totalRead,
  };
};

const updateNotification = async (id, updateData) => {
  const updatedNotification = await Notification.findOneAndUpdate(
    { _id: id },
    { $set: { status: updateData } },
    { new: true }
  );

  return updatedNotification;
};

const createChildSafetyPolicy = async (privacyBody) => {
  if (privacyBody.content) {
    privacyBody.content = he.decode(privacyBody.content);
  }

  const existingPrivacy = await ChildSafetyPolicy.findOne();
  if (existingPrivacy) {
    existingPrivacy.set(privacyBody);
    await existingPrivacy.save();
    return existingPrivacy;
  } else {
    const newPrivacy = await ChildSafetyPolicy.create(privacyBody);
    return newPrivacy;
  }
};

const queryChildSafetyPolicy = async () => {
  const privacy = await ChildSafetyPolicy.find();
  return privacy;
};

module.exports = {
  createPrivacy,
  queryPrivacy,
  createTerms,
  queryTerms,
  createAboutUs,
  queryAboutUs,

  createSupport,
  querySupport,

  updateFees,
  getFees,

  gerAllNotifications,
  updateNotification,

  createChildSafetyPolicy,
  queryChildSafetyPolicy,
};
