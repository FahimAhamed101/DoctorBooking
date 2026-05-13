const multer = require("multer");
const path = require("path");

module.exports = function (UPLOADS_FOLDER) {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, UPLOADS_FOLDER); // Use the provided destination folder
    },
    filename: (req, file, cb) => {
      const fileExt = path.extname(file.originalname);
      const filename =
        file.originalname
          .replace(fileExt, "")
          .toLocaleLowerCase()
          .split(" ")
          .join("-") +
        "-" +
        Date.now();

      cb(null, filename + fileExt);
    },
  });

  const upload = multer({
    storage: storage,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
    },
    fileFilter: (req, file, cb) => {
      if (
        file.mimetype == "image/jpg" ||
        file.mimetype == "image/png" ||
        file.mimetype == "image/jpeg" ||
        file.mimetype == "image/heic" ||
        file.mimetype == "image/heif" ||
        file.mimetype == "image/pdf" ||
        file.mimetype == "image/illustrator" ||
        file.mimetype == "image/msword" ||
        file.mimetype == "image/postscript" ||
        file.mimetype == "image/eps" ||
        file.mimetype == "image/vnd.openxmlformats-officedocument.wordprocessingml.document" // .docx
      ) {
        cb(null, true);

      } else {
        cb(new Error("Only jpg, png, jpeg, fdf, doc, docx format allowed!"));
      }
    },
  });

  return upload; // Return the configured multer upload middleware
};
