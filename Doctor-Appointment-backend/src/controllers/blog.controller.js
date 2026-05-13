const httpStatus = require("http-status");
const pick = require("../utils/pick");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const response = require("../config/response");
const { blogService } = require("../services");
const slugify = require("slugify");

// Create a new blog
const createBlog = catchAsync(async (req, res) => {
  const isBlogExists = await blogService.getBlogByTitle(req.body.title);
  if (isBlogExists) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Blog with this title already exists"
    );
  }

  req.body.author = req.user.id;
  if (req.file) {
    req.body.coverImage = "/uploads/blogs/" + req.file.filename;
  }

  if (typeof req.body.tags === "string") {
    try {
      req.body.tags = JSON.parse(req.body.tags);
    } catch (error) {
      return res.status(httpStatus.BAD_REQUEST).json(
        response({
          status: "Error",
          statusCode: httpStatus.BAD_REQUEST,
          message: "Invalid tags JSON format",
          error: error.message,
        })
      );
    }
  }

  if (req.body.title) {
    req.body.slug = slugify(req.body.title, { lower: true, strict: true });
  }

  const blog = await blogService.createBlog(req.body);

  res.status(httpStatus.CREATED).json(
    response({
      message: "Blog Created",
      status: "OK",
      statusCode: httpStatus.CREATED,
      data: blog,
    })
  );
});

// Get list of blogs (with filters, pagination, etc.)
const getBlogs = catchAsync(async (req, res) => {
  const filter = pick(req.query, [
    "title",
    "slug",
    "tags",
    "category",
    "summary",
  ]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const result = await blogService.queryBlogs(filter, options);

  res.status(httpStatus.OK).json(
    response({
      message: "Blogs Retrieved",
      status: "OK",
      statusCode: httpStatus.OK,
      data: result,
    })
  );
});

// Get a blog by slug
const getBlogBySlug = catchAsync(async (req, res) => {
  const blog = await blogService.getBlogBySlug(req.params.slug);
  res.status(httpStatus.OK).json(
    response({
      message: "Blog Retrieved",
      status: "OK",
      statusCode: httpStatus.OK,
      data: blog,
    })
  );
});

// Update a blog by ID
const updateBlog = catchAsync(async (req, res) => {
  if (req.file) {
    req.body.coverImage = "/uploads/blogs/" + req.file.filename;
  }

  if (typeof req.body.tags === "string") {
    try {
      req.body.tags = JSON.parse(req.body.tags);
    } catch (error) {
      return res.status(httpStatus.BAD_REQUEST).json(
        response({
          status: "Error",
          statusCode: httpStatus.BAD_REQUEST,
          message: "Invalid tags JSON format",
          error: error.message,
        })
      );
    }
  }

  if (req.body.title) {
    req.body.slug = slugify(req.body.title, { lower: true, strict: true });
  }

  const updatedBlog = await blogService.updateBlogById(
    req.params.slug,
    req.body
  );

  res.status(httpStatus.OK).json(
    response({
      message: "Blog Updated",
      status: "OK",
      statusCode: httpStatus.OK,
      data: updatedBlog,
    })
  );
});

// Delete a blog by slug (soft delete)
const deleteBlog = catchAsync(async (req, res) => {
  const deletedBlog = await blogService.deleteBlogBySlug(req.params.slug);
  res.status(httpStatus.OK).json(
    response({
      message: "Blog Deleted",
      status: "OK",
      statusCode: httpStatus.OK,
      data: deletedBlog,
    })
  );
});

module.exports = {
  createBlog,
  getBlogs,
  getBlogBySlug,
  updateBlog,
  deleteBlog,
};
