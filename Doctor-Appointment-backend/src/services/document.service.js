const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const { Document } = require("../models");


// Create a new document
const createDocument = async (documentData) => {
  const document = await Document.create(documentData);
  return document;
};

// Get document by ID
const getDocumentById = async (id) => {
  const document = await Document.findById(id);
  if (!document || document.isDeleted) {
    throw new ApiError(httpStatus.NOT_FOUND, "Document not found");
  }
  return document;
};

// Update document by ID
const updateDocumentById = async (id, updateData) => {
  const document = await Document.findOneAndUpdate(
    { _id: id, isDeleted: false },
    updateData,
    { new: true }
  );
  if (!document) {
    throw new ApiError(httpStatus.NOT_FOUND, "Document not found");
  }
  return document;
};

// Delete document by ID (soft delete)
const deleteDocumentById = async (id) => {
  const document = await Document.findById(id);
  if (!document || document.isDeleted) {
    throw new ApiError(httpStatus.NOT_FOUND, "Document not found");
  }
  document.isDeleted = true;
  await document.save();

  return document;
};

// Get all documents
const getAllDocuments = async () => {
  const documents = await Document.find({ isDeleted: false });
  return documents;
};

const getAllUserDocuments = async (filter, options, userId) => {
  const query = { isDeleted: false, user: userId };

  for (const key of Object.keys(filter)) {
    if (key === "title" && filter[key] !== "") {
      query[key] = { $regex: filter[key], $options: "i" };
    } else if (filter[key] !== "") {
      query[key] = filter[key];
    }
  }

  const documents = await Document.paginate(query, options);

  return documents;
};

const queryDocuments = async (filter, options) => {
  const query = { isDeleted: false };

  for (const key of Object.keys(filter)) {
    if (key === "title" && filter[key] !== "") {
      query[key] = { $regex: filter[key], $options: "i" };
    } else if (filter[key] !== "") {
      query[key] = filter[key];
    }
  }

  const documents = await Document.paginate(query, options);

  return documents;
};

const queryDocumentsByUserId = async (userId) => {
  const documents = await Document.find({
    isDeleted: false,
    user: userId,
  }).sort({ createdAt: -1 });
  return documents;
};

module.exports = {
  createDocument,
  getDocumentById,
  updateDocumentById,
  deleteDocumentById,
  getAllDocuments,
  queryDocuments,
  queryDocumentsByUserId,
  getAllUserDocuments
};
