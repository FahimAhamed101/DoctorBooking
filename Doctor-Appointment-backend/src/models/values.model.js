const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const valuesSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "The Name field is required"],
            minlength: [5, "Question must be at least 5 characters long"],
            maxlength: [500, "Question must not exceed 500 characters"],
        },
        description: {
            type: String,
            required: [true, "The Description field is required"],
            minlength: [5, "Answer must be at least 5 characters long"],
        },
        icon: {
            type: String,
            required: [true, "The icon field is required"],
        },
        isDeleted: { type: Boolean, default: false },
    },
    { timestamps: true }
);

valuesSchema.plugin(toJSON);
valuesSchema.plugin(paginate);

module.exports = mongoose.model("values", valuesSchema);
