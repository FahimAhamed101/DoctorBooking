const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const response = require("../config/response");
const { contactService } = require("../services");
const pick = require("../utils/pick");

// Create a new contact
const createContact = catchAsync(async (req, res) => {
  if (req.body.fullName) {
    req.body.fullName = req.body.fullName;
  } else if (req.body.firstName && req.body.lastName) {
    req.body.firstName = req.body.firstName;
    req.body.lastName = req.body.lastName || "";
    req.body.fullName = `${req.body.firstName} ${req.body.lastName}`;
  }

  const updateBody = req.body;

  const contact = await contactService.createContacts(updateBody);
  res.status(httpStatus.CREATED).json(
    response({
      message: `${contact.firstName} successfully sent a message`,
      status: "OK",
      statusCode: httpStatus.CREATED,
      data: {},
    })
  );
});

// Get a single contact by ID
const getContact = catchAsync(async (req, res) => {
  const contact = await contactService.getContactById(req.params.contactId);
  if (!contact) {
    return res.status(httpStatus.NOT_FOUND).json(
      response({
        message: "Contact not found",
        status: "NOT_FOUND",
        statusCode: httpStatus.NOT_FOUND,
      })
    );
  }
  res.status(httpStatus.OK).json(
    response({
      message: "Contact retrieved",
      status: "OK",
      statusCode: httpStatus.OK,
      data: contact,
    })
  );
});

// Get all contacts
const getContacts = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["fullName", "email", "phoneNumber", "address"]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const contacts = await contactService.getAllcontact(filter, options);
  res.status(httpStatus.OK).json(
    response({
      message: "Contacts retrieved",
      status: "OK",
      statusCode: httpStatus.OK,
      data: contacts,
    })
  );
});

module.exports = {
  createContact,
  getContact,
  getContacts,
};
