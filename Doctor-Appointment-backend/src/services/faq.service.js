const httpStatus = require("http-status");
const { FAQ } = require("../models");
const ApiError = require("../utils/ApiError");
const mongoose = require("mongoose");

const createFAQ = async (faqBody) => {
  const faqExest = await FAQ.findOne({ question: faqBody.question });
  if (faqExest) {
    throw new ApiError(httpStatus.BAD_REQUEST, "The question is alrady have.");
  }
  const faq = await FAQ.create({ ...faqBody });
  return faq;
};

const getFAQById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid FAQ ID");
  }

  const faq = await FAQ.find({ _id: id, isDeleted: false });

  if (!faq) {
    throw new ApiError(httpStatus.NOT_FOUND, "FAQ not found");
  }

  return faq;
};

const updateFAQById = async (faqId, updateBody) => {
  if (!mongoose.Types.ObjectId.isValid(faqId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid FAQ ID");
  }

  const faq = await FAQ.findById(faqId);

  if (!faq) {
    throw new ApiError(httpStatus.NOT_FOUND, "FAQ not found");
  }

  Object.assign(faq, updateBody);
  await faq.save();
  return faq;
};

const deleteFAQById = async (faqId) => {
  if (!mongoose.Types.ObjectId.isValid(faqId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid FAQ ID");
  }

  const faq = await FAQ.findById(faqId);

  if (!faq) {
    throw new ApiError(httpStatus.NOT_FOUND, "FAQ not found");
  }

  faq.isDeleted = true;
  await faq.save();
  return faq;
};

const queryFAQs = async (filter, options) => {
  const faqs = await FAQ.paginate({ ...filter, isDeleted: false }, options);
  return faqs;
};

module.exports = {
  createFAQ,
  getFAQById,
  updateFAQById,
  deleteFAQById,
  queryFAQs,
};
