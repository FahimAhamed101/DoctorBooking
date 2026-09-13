const { uploadToCloudinary } = require("../utils/cloudinary");

/**
 * Middleware that automatically uploads multer file(s) to Cloudinary
 * and sets req.file.path, req.file.url, req.file.secure_url to the Cloudinary URL.
 * @param {string} folder - Destination subfolder on Cloudinary
 */
const cloudinaryUploadMiddleware = (folder = "uploads") => {
  return async (req, res, next) => {
    try {
      const cleanFolder = folder.replace(/^\.\/public\/uploads\/?/, "").replace(/^\/?uploads\/?/, "");
      const targetFolder = `doctor-booking/${cleanFolder || "general"}`;

      if (req.file && req.file.path) {
        const result = await uploadToCloudinary(req.file.path, {
          folder: targetFolder,
          resource_type: "auto",
        });

        if (result && result.secure_url) {
          req.file.path = result.secure_url;
          req.file.url = result.secure_url;
          req.file.secure_url = result.secure_url;
          req.file.filename = result.secure_url;
          req.file.cloudinaryId = result.public_id;
        }
      }

      if (req.files) {
        if (Array.isArray(req.files)) {
          for (const file of req.files) {
            if (file.path) {
              const result = await uploadToCloudinary(file.path, {
                folder: targetFolder,
                resource_type: "auto",
              });
              if (result && result.secure_url) {
                file.path = result.secure_url;
                file.url = result.secure_url;
                file.secure_url = result.secure_url;
                file.filename = result.secure_url;
                file.cloudinaryId = result.public_id;
              }
            }
          }
        } else if (typeof req.files === "object") {
          for (const fieldName of Object.keys(req.files)) {
            const fileList = req.files[fieldName];
            if (Array.isArray(fileList)) {
              for (const file of fileList) {
                if (file.path) {
                  const result = await uploadToCloudinary(file.path, {
                    folder: targetFolder,
                    resource_type: "auto",
                  });
                  if (result && result.secure_url) {
                    file.path = result.secure_url;
                    file.url = result.secure_url;
                    file.secure_url = result.secure_url;
                    file.filename = result.secure_url;
                    file.cloudinaryId = result.public_id;
                  }
                }
              }
            }
          }
        }
      }

      next();
    } catch (error) {
      console.error("Cloudinary upload middleware error:", error.message);
      // Even if Cloudinary has a network issue, continue with local file rather than crashing
      next();
    }
  };
};

module.exports = cloudinaryUploadMiddleware;
