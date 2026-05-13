const httpStatus = require("http-status");
const { Blog } = require("../models");
const ApiError = require("../utils/ApiError");
const mongoose = require("mongoose");

// Create a new blog post
const createBlog = async (blogData) => {
  const blog = await Blog.create({ ...blogData });
  return blog;
};

// Get a single blog post by slug
const getBlogBySlug = async (slug) => {
  const blog = await Blog.findOne({ slug, isDeleted: false }).populate("author", "fullName email profileImage");

  if (!blog) {
    throw new ApiError(httpStatus.NOT_FOUND, "Blog not found");
  }

  return blog;
};

const getBlogByTitle = async (title) => {
  const blog = await Blog.findOne({ title, isDeleted: false });

  return blog;
};

// Soft delete a blog by slug
const deleteBlogBySlug = async (slug) => {
  const blog = await Blog.findOne({ slug, isDeleted: false });

  if (!blog) {
    throw new ApiError(httpStatus.NOT_FOUND, "Blog not found");
  }

  blog.isDeleted = true;
  await blog.save();

  return blog;
};

// Update a blog by ID
const updateBlogById = async (slug, updateBody) => {

  const blog = await getBlogBySlug(slug);

  if (!blog || blog.isDeleted) {
    throw new ApiError(httpStatus.NOT_FOUND, "Blog not found");
  }

  Object.assign(blog, updateBody);
  await blog.save();
  return blog;
};

// Query blogs with pagination, filters, etc.
const queryBlogs = async (filter = {}, options = {}) => {
  const query = { isDeleted: false, isPublished: true };

  for (const key of Object.keys(filter)) {
    if (
      ["title", "slug", "summary", "category", "tags"].includes(key) &&
      filter[key]?.trim() !== ""
    ) {
      query[key] = { $regex: filter[key], $options: "i" };
    } else if (filter[key] !== "") {
      query[key] = filter[key];
    }
  }

  const blogs = await Blog.paginate(query, options);
  return blogs;
};

module.exports = {
  createBlog,
  getBlogBySlug,
  deleteBlogBySlug,
  updateBlogById,
  queryBlogs,
  getBlogByTitle
};
