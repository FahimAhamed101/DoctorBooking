const mongoose = require("mongoose");
const validator = require("validator");
const { toJSON, paginate } = require("./plugins");

const contactSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      trim: true,
      default: "",
    },
    lastName: {
      type: String,
      default: "",
    },
    fullName: {
      type: String,
      trim: true,
      required: true,
      default: "",
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid email");
        }
      },
    },
    phoneNumber: {
      type: String,
      required: false,
      default: "",

    },
    address: {
      type: String,
      required: false,
      default: "",
    },
    message: {
      type: String,
      required: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

contactSchema.plugin(toJSON);
contactSchema.plugin(paginate);

const Contact = mongoose.model("Contact", contactSchema);

module.exports = Contact;
