const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const subscriptionSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: [3, "Title must be at least 3 characters long."],
    },
    limitation: {
      type: String,
      required: true,
      trim: true,
      enum: ["annual", "monthly", "weekly"],
    },
    stripePriceId: {
      type: String,
      required: true,
    },
    days: {
      type: Number,
      required: true,
      min: [0, "Day must be a positive."],
    },
    amount: {
      type: Number,
      required: true,
      min: [0, "Amount must be a positive value."],
    },
    features: {
      type: [String],
      required: [true, "Features are required"],
      default: [],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

subscriptionSchema.plugin(toJSON);
subscriptionSchema.plugin(paginate);

module.exports = mongoose.model("Subscription", subscriptionSchema);
