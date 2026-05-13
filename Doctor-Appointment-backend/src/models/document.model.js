const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const documentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sendBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    title: {
      type: String,
      required: false,
      default: null,
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: false,
    },
    description: {
      type: String,
      required: false,
      default: null,
    },
    type: {
      type: String,
      required: true,
      trim: true,
      enum: [
        "prescription",
        "medical certificate",
        "discharge summary",
        "medical history record",
        "lab reports",
        "referral letter",
        "operative report",
        "immunization record",
        "radiology reports",
        "progress notes",
        "consent forms",
        "insurance",
        "other"
      ],
    },
    files: {
      type: [String],
      required: true,
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

documentSchema.plugin(toJSON);
documentSchema.plugin(paginate);

module.exports = mongoose.model("Document", documentSchema);
