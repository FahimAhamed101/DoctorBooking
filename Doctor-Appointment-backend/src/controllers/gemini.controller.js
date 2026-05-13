const httpStatus = require("http-status");
const pick = require("../utils/pick");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const response = require("../config/response");
const { geminiService } = require("../services");

const conversitions = catchAsync(async (req, res) => {
  const { model, prompt } = req.body;

  const updatePromest = `
  For the Doctor's advice E-clinic platform

  ${prompt}
  `

  const result = await geminiService.chartAI(model, updatePromest);

  res.status(httpStatus.OK).json(
    response({
      message: "Response from AI",
      status: "OK",
      statusCode: httpStatus.OK,
      data: result,
    })
  );
});

const allModels = catchAsync(async (req, res) => {
  const faq = await geminiService.getAllModels();

  res.status(httpStatus.CREATED).json(
    response({
      message: "All Models",
      status: "OK",
      statusCode: httpStatus.CREATED,
      data: faq,
    })
  );
});

module.exports = {
  allModels,
  conversitions
};
