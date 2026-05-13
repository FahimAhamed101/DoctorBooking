const httpStatus = require("http-status");
const pick = require("../utils/pick");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const response = require("../config/response");
const { faqService } = require("../services");

const faqCreate = catchAsync(async (req, res) => {
    const faq = await faqService.createFAQ(req.body);

    res.status(httpStatus.CREATED).json(
        response({
            message: "FAQ Created",
            status: "OK",
            statusCode: httpStatus.CREATED,
            data: faq,
        })
    );
});

const faqGetById = catchAsync(async (req, res) => {
    const faq = await faqService.getFAQById(req.params.id);
    res.status(httpStatus.OK).json(
        response({
            message: "FAQ Retrieved",
            status: "OK",
            statusCode: httpStatus.OK,
            data: faq,
        })
    );
});

const faqUpdateById = catchAsync(async (req, res) => {
    const faq = await faqService.updateFAQById(req.params.id, req.body);
    res.status(httpStatus.OK).json(
        response({
            message: "FAQ Updated",
            status: "OK",
            statusCode: httpStatus.OK,
            data: faq,
        })
    );
});

const faqDeleteById = catchAsync(async (req, res) => {
    const faq = await faqService.deleteFAQById(req.params.id);
    res.status(httpStatus.OK).json(
        response({
            message: "FAQ Deleted",
            status: "OK",
            statusCode: httpStatus.OK,
            data: faq,
        })
    );
});

const faqList = catchAsync(async (req, res) => {
    const filter = pick(req.query, ["question", "answer"]);
    const options = pick(req.query, ["sortBy", "limit", "page"]);
    const result = await faqService.queryFAQs(filter, options);
    res.status(httpStatus.OK).json(
        response({
            message: "FAQs Retrieved",
            status: "OK",
            statusCode: httpStatus.OK,
            data: result,
        })
    );
});

module.exports = {
    faqCreate,
    faqGetById,
    faqUpdateById,
    faqDeleteById,
    faqList,
};
