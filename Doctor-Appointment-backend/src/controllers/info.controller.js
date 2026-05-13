const httpStatus = require("http-status");
const pick = require("../utils/pick");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const response = require("../config/response");
const { infoService } = require("../services");

const createPrivacy = catchAsync(async (req, res) => {
  const privacy = await infoService.createPrivacy(req.body);
  res
    .status(httpStatus.CREATED)
    .json(
      response({
        message: "Privacy Policy Created",
        status: "OK",
        statusCode: httpStatus.CREATED,
        data: privacy,
      })
    );
});

const queryPrivacy = catchAsync(async (req, res) => {
  const result = await infoService.queryPrivacy();
  res
    .status(httpStatus.OK)
    .json(
      response({
        message: "Privacy Policy",
        status: "OK",
        statusCode: httpStatus.OK,
        data: result,
      })
    );
});

const createTerms = catchAsync(async (req, res) => {
  const terms = await infoService.createTerms(req.body);
  res
    .status(httpStatus.CREATED)
    .json(
      response({
        message: "Terms and Condition Created",
        status: "OK",
        statusCode: httpStatus.CREATED,
        data: terms,
      })
    );
});

const queryTerms = catchAsync(async (req, res) => {
  const result = await infoService.queryTerms();
  res
    .status(httpStatus.OK)
    .json(
      response({
        message: "Terms and Condition",
        status: "OK",
        statusCode: httpStatus.OK,
        data: result,
      })
    );
});

const createAboutUs = catchAsync(async (req, res) => {
  const trustSafety = await infoService.createAboutUs(req.body);
  res
    .status(httpStatus.CREATED)
    .json(
      response({
        message: "About us Created",
        status: "OK",
        statusCode: httpStatus.CREATED,
        data: trustSafety,
      })
    );
});

const queryAboutUs = catchAsync(async (req, res) => {
  const result = await infoService.queryAboutUs();
  res
    .status(httpStatus.OK)
    .json(
      response({
        message: "About us",
        status: "OK",
        statusCode: httpStatus.OK,
        data: result,
      })
    );
});

const createSupport = catchAsync(async (req, res) => {
  const trustSafety = await infoService.createSupport(req.body);
  res
    .status(httpStatus.CREATED)
    .json(
      response({
        message: "Support Created",
        status: "OK",
        statusCode: httpStatus.CREATED,
        data: trustSafety,
      })
    );
});

const querySupport = catchAsync(async (req, res) => {
  const result = await infoService.querySupport();
  res
    .status(httpStatus.OK)
    .json(
      response({
        message: "Support",
        status: "OK",
        statusCode: httpStatus.OK,
        data: result,
      })
    );
});

const getAllNotifications = catchAsync(async (req, res) => {
  const notification = await infoService.gerAllNotifications(req.user.id);
  res.status(httpStatus.OK).json(
    response({
      message: "Notifications fetched successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: notification,
    })
  );
});

const updateNotification = catchAsync(async (req, res) => {
  const { notificationId } = req.body;
  const status = "read";

  const notification = await infoService.updateNotification(
    notificationId,
    status
  );
  res.status(httpStatus.OK).json(
    response({
      message: "Notifications fetched successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: notification,
    })
  );
});

const renderPrivacyPage = catchAsync(async (req, res) => {
  const privacy = await infoService.queryPrivacy();

  res.render("privacy", {
    title: "Privacy Policy",
    privacyData: privacy[0]?.content,
  });
});

const renderAboutUsPage = catchAsync(async (req, res) => {
  const privacy = await infoService.queryAboutUs();

  res.render("aboutUs", {
    title: "About Us",
    aboutUsData: privacy[0]?.content,
  });
});

const renderTermsConditionPage = catchAsync(async (req, res) => {
  const privacy = await infoService.queryTerms();

  res.render("termsAndCondition", {
    title: "Terms And Condition",
    renderTermsConditionData: privacy[0]?.content,
  });
});

const createChildSafetyPolicy = catchAsync(async (req, res) => {
  const privacy = await infoService.createChildSafetyPolicy(req.body);
  res.status(httpStatus.CREATED).json(
    response({
      message: "Child Safety Policy Created",
      status: "OK",
      statusCode: httpStatus.CREATED,
      data: privacy,
    })
  );
});

const queryChildSafetyPolicy = catchAsync(async (req, res) => {
  const result = await infoService.queryChildSafetyPolicy();
  res.status(httpStatus.OK).json(
    response({
      message: "Child Safety Policy",
      status: "OK",
      statusCode: httpStatus.OK,
      data: result,
    })
  );
});

const renderChildSafetyPolicy = catchAsync(async (req, res) => {
  const privacy = await infoService.queryChildSafetyPolicy();

  res.render("childSafetyPolicy", {
    title: "Ndolo Dating App - Child Safety Policy",
    childSafetyPolicy: privacy[0].content,
  });
});

module.exports = {
  createPrivacy,
  queryPrivacy,
  createTerms,
  queryTerms,
  createAboutUs,
  queryAboutUs,
  createSupport,
  querySupport,

  getAllNotifications,
  updateNotification,

  renderPrivacyPage,
  renderAboutUsPage,
  renderTermsConditionPage,

  createChildSafetyPolicy,
  queryChildSafetyPolicy,
  renderChildSafetyPolicy,
};
