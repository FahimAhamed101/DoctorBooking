const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

// Degrees Schema
const degreesSchema = mongoose.Schema({
  school: {
    type: String,
    required: false,
    default: null,
  },
  degree: {
    type: String,
    required: false,
    default: null,
  },
  subject: {
    type: String,
    required: false,
    default: null,
  },
  grade: {
    type: String,
    required: false,
    default: null,
  },
  startDate: {
    type: Date,
    required: false,
  },
  endDate: {
    type: Date,
    required: false,
  },
  skills: {
    type: [String],
    default: [],
  },
  status: {
    type: String,
    enum: ["current", "completed"],
    default: "completed",
  },
});

// Experience Schema
const experienceSchema = mongoose.Schema({
  title: {
    type: String,
    required: false,
    default: null,
  },
  employmentType: {
    type: String,
    required: false,
    enum: ["Full-time", "Part-time", "Freelance", "Internship"],
    default: "Full-time",
  },
  company: {
    type: String,
    required: false,
    default: null,
  },
  location: {
    type: String,
    required: false,
    default: null,
  },
  startDate: {
    type: Date,
    required: false,
  },
  endDate: {
    type: Date,
    required: false,
  },
  description: {
    type: String,
    required: false,
    default: null,
  },
  profileHeadline: {
    type: String,
    required: false,
    default: null,
  },
  skills: {
    type: [String],
    default: [],
  },
  status: {
    type: String,
    enum: ["current", "completed"],
    default: "completed",
  },
});

// Achievements Schema
const achievementsSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["achieved", "ongoing"],
    default: "achieved",
  },
});

// Team Schema
const teamSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    firstName: {
      type: String,
      required: false,
      default: null,
    },
    lastName: {
      type: String,
      required: false,
      default: null,
    },
    fullName: {
      type: String,
      required: false,
      trim: true,
      default: null,
    },
    designation: {
      type: String,
      required: false,
      default: "No designation",
    },
    specialties: {
      type: String,
      required: false,
      default: "No specialties",
    },
    about: {
      type: String,
      required: false,
      default: "No about",
    },
     callingCode: {
      type: String,
      required: false,
      default: null
    },
    phoneNumber: {
      type: Number,
      required: false,
      default: null
    },
    email: {
      type: String,
      required: true,
      match: [/.+@.+\..+/, "Please enter a valid email address."],
    },
    profileImage: {
      type: String,
      required: false,
      default: "/uploads/users/user.png",
    },
    media: {
      type: Object,
      default: { facebook: null, instagram: null, linkedin: null, X: null },
      properties: {
        facebook: { type: String, required: false },
        instagram: { type: String, required: false },
        linkedin: { type: String, required: false },
        X: { type: String, required: false },
      },
    },

    degrees: [degreesSchema],
    experience: [experienceSchema],
    achievements: [achievementsSchema],

    isAdmin: {
      type: Boolean,
      default: false,
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

// Apply Plugins
teamSchema.plugin(toJSON);
teamSchema.plugin(paginate);

// Export Model
module.exports = mongoose.model("Team", teamSchema);
