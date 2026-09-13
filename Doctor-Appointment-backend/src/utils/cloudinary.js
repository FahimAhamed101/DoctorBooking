const cloudinary = require("cloudinary").v2;
const config = require("../config/config");
const fs = require("fs");

cloudinary.config({
  cloud_name: config.cloudinary.cloud_name || process.env.CLOUDINARY_CLOUD_NAME,
  api_key: config.cloudinary.api_key || process.env.CLOUDINARY_API_KEY,
  api_secret: config.cloudinary.api_secret || process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a local file to Cloudinary
 * @param {string} filePath - Absolute or relative path to the local file
 * @param {object} options - Cloudinary upload options
 * @returns {Promise<object>} Cloudinary upload result
 */
const uploadToCloudinary = async (filePath, options = {}) => {
  try {
    const uploadOptions = {
      folder: "doctor-booking",
      resource_type: "auto",
      ...options,
    };

    const result = await cloudinary.uploader.upload(filePath, uploadOptions);

    // Optionally remove temporary local file after successful upload
    if (options.removeLocal && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.warn("Could not delete local file:", filePath, err.message);
      }
    }

    return result;
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    throw error;
  }
};

/**
 * Delete an asset from Cloudinary
 * @param {string} publicId - Cloudinary public_id
 * @returns {Promise<object>}
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Cloudinary delete failed:", error);
    throw error;
  }
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
  deleteFromCloudinary,
};
