const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      default: null,
    },
    deviceGUID: {
      type: String,
      required: false,
      default: null,
    },
    amount: {
      type: Number,
      required: true,
      min: [0, "Amount must be a positive value."],
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
    },
    striperPiceId: {
      type: String,
    },
    checkoutSessionId: {
      type: String,
    },
    mode: {
      type: String,
    },
    status: {
      type: String,
      enum: ["panding", "completed", "canceled"],
      default: "panding",
      required: true,
    },
    stripeInfo: {
      type: Object,
      default: {},
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Apply the plugins to theTtransaction schema
transactionSchema.plugin(toJSON);
transactionSchema.plugin(paginate);

module.exports = mongoose.model("Transaction", transactionSchema);
