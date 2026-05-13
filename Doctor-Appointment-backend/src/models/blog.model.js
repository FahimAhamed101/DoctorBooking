const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: 300,
    },
    slug: {
      type: String,
      unique: true,
      required: [true, "Slug is required"],
      lowercase: true,
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Content is required"],
    },
    summary: {
      type: String,
      maxlength: 500,
    },
    coverImage: {
      type: String,
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    category: {
      type: String,
      trim: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
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

blogSchema.pre("validate", async function (next) {
  if (!this.slug && this.title) {
    let newSlug = slugify(this.title, { lower: true, strict: true });
    let slugExists = await mongoose.models.Blog.findOne({ slug: newSlug });

    let count = 1;
    while (slugExists) {
      newSlug = `${slugify(this.title, { lower: true, strict: true })}-${count}`;
      slugExists = await mongoose.models.Blog.findOne({ slug: newSlug });
      count++;
    }

    this.slug = newSlug;
  }

  next();
});

// Plugins
blogSchema.plugin(toJSON);
blogSchema.plugin(paginate);

// Index for slug and tags
blogSchema.index({ slug: 1 });

module.exports = mongoose.model("Blog", blogSchema);
