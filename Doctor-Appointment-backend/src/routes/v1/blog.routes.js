const express = require("express");
const auth = require("../../middlewares/auth");
const validate = require("../../middlewares/validate");
const { blogController } = require("../../controllers");
const userFileUploadMiddleware = require("../../middlewares/fileUpload");
const convertHeicToPngMiddleware = require("../../middlewares/converter");
const UPLOADS_FOLDER_BLOG = "./public/uploads/blogs";

const uploadUsers = userFileUploadMiddleware(UPLOADS_FOLDER_BLOG);

const router = express.Router();

router
  .route("/")
  .get(blogController.getBlogs)
  .post(
    auth("superAdmin"),
    [uploadUsers.single("coverImage")],
    convertHeicToPngMiddleware(UPLOADS_FOLDER_BLOG),
    blogController.createBlog
  );

router
  .route("/:slug")
  .get(blogController.getBlogBySlug)
  .patch(
    auth("superAdmin"),
    [uploadUsers.single("coverImage")],
    convertHeicToPngMiddleware(UPLOADS_FOLDER_BLOG),
    blogController.updateBlog
  )
  .delete(auth("superAdmin"), blogController.deleteBlog);

module.exports = router;
