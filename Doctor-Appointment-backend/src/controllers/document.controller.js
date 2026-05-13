const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const response = require("../config/response");
const { documentService } = require("../services");
const ApiError = require("../utils/ApiError");
const pick = require("../utils/pick");

const createDocument = catchAsync(async (req, res) => {
  req.body.user = req.user.id;

  if (req.files && req.files.files && req.files.files.length > 0) {
    req.body.files = req.files.files.map(
      (file) => `/uploads/files/${file.filename}`
    );
  }

  const newDocument = await documentService.createDocument(req.body);

  res.status(httpStatus.CREATED).send(
    response({
      status: "OK",
      statusCode: httpStatus.CREATED,
      message: "Document uploaded successfully",
      data: newDocument,
    })
  );
});

const getAllUserDocuments = catchAsync(async (req, res) => {
   const filter = pick(req.query, ["title"]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const deletedDocument = await documentService.getAllUserDocuments(filter, options, req.user.id);

  if (!deletedDocument) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Document not found");
  }

  res.status(httpStatus.OK).send(
    response({
      status: "OK",
      statusCode: httpStatus.NO_CONTENT,
      message: "Document deleted successfully",
      data: { deletedDocument },
    })
  );
});

const getAllDocuments = catchAsync(async (req, res) => {
  const documents = await documentService.getAllDocuments();
  res.status(httpStatus.OK).send(
    response({
      status: "OK",
      statusCode: httpStatus.OK,
      message: "Documents retrieved successfully",
      data: documents,
    })
  );
});

const getDocumentById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const document = await documentService.getDocumentById(id);
  if (!document) {
    return res.status(httpStatus.NOT_FOUND).send(
      response({
        status: "Error",
        statusCode: httpStatus.NOT_FOUND,
        message: "Document not found",
        error: "Document with the provided ID does not exist",
      })
    );
  }
  res.status(httpStatus.OK).send(
    response({
      status: "OK",
      statusCode: httpStatus.OK,
      message: "Document retrieved successfully",
      data: document,
    })
  );
});

const updateDocumentById = catchAsync(async (req, res) => {
  const { id } = req.params;

  if (req.files && req.files.files && req.files.files.length > 0) {
    req.body.files = req.files.files.map(
      (file) => `/uploads/files/${file.filename}`
    );
  }

  const updatedDocument = await documentService.updateDocumentById(
    id,
    req.body
  );

  if (!updatedDocument) {
    return res.status(httpStatus.NOT_FOUND).send(
      response({
        status: "Error",
        statusCode: httpStatus.NOT_FOUND,
        message: "Document not found",
        error: "Document with the provided ID does not exist",
      })
    );
  }

  res.status(httpStatus.OK).send(
    response({
      status: "OK",
      statusCode: httpStatus.OK,
      message: "Document updated successfully",
      data: updatedDocument,
    })
  );
});

const deleteDocumentById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const deletedDocument = await documentService.deleteDocumentById(id);

  if (!deletedDocument) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Document not found");
  }

  res.status(httpStatus.OK).send(
    response({
      status: "OK",
      statusCode: httpStatus.NO_CONTENT,
      message: "Document deleted successfully",
      data: { deletedDocument },
    })
  );
});

module.exports = {
  createDocument,
  getAllDocuments,
  getDocumentById,
  updateDocumentById,
  deleteDocumentById,
  getAllUserDocuments
};
