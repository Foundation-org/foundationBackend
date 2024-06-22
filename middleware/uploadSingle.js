const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Define the path to the uploads folder
const uploadFolder = "assets/uploads/images/";

// Create the uploads folder if it doesn't exist
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, { recursive: true }); // Use recursive: true to create nested directories
}

// Define storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Specify the directory where uploaded files will be stored
    cb(null, uploadFolder);
  },
  filename: function (req, file, cb) {
    // Generate a unique filename based on the current timestamp in ISO date string format
    const isoDateString = new Date().toISOString().replace(/[:.-]/g, '');

    // Specify the filename of the uploaded file
    cb(null, `${isoDateString}${path.extname(file.originalname)}`);
  },
});

// Initialize multer with the storage options
const upload = multer({ storage: storage });

// Middleware function to handle single file upload
const uploadSingle = upload.single("file");

module.exports = {
  uploadSingle,
};
