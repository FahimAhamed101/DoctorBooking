const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const questionAnswerSchema = new mongoose.Schema(
    {
        question: {
            type: String,
            required: [true, "The question field is required"],
            minlength: [5, "Question must be at least 5 characters long"],
            maxlength: [500, "Question must not exceed 500 characters"],
        },
        answer: {
            type: String,
            required: [true, "The answer field is required"],
            minlength: [5, "Answer must be at least 5 characters long"],
            maxlength: [1000, "Answer must not exceed 1000 characters"],
        },
        isDeleted: { type: Boolean, default: false },
    },
    { timestamps: true }
);

questionAnswerSchema.plugin(toJSON);
questionAnswerSchema.plugin(paginate);

module.exports = mongoose.model("FAQ", questionAnswerSchema);
