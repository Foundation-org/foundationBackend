const path = require("path");
const { s3ImageUpload } = require("../utils/uploadS3Bucket");
const fs = require('fs');

const s3ImageUploadToFrames = async (req, res) => {
    try {
        // Check if a file was uploaded
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Check if the uploaded file is an image
        if (!req.file.mimetype.startsWith('image/')) {
            return res.status(400).json({ message: 'Uploaded file is not an image' });
        }

        // Pass the file information to the next layer for processing
        const filePath = req.file.path;
        const fileName = path.basename(filePath);
        const fileBuffer = fs.readFileSync(filePath);

        const s3ImageUrl = await s3ImageUpload({
            fileBuffer,
            fileName,
        })

        //Delete File from Server After Uploading to S3

        // // Construct the local file location relative to the 'foundationBackend' directory
        // const localFileLocation = path.join(__dirname, '..', 'assets', 'uploads', 'images', filePath);

        // console.log(localFileLocation);

        // // Delete the file
        // fs.unlink({ localFileLocation }, (err) => {
        //     if (err) {
        //         console.error('Error deleting file:', err);
        //         return;
        //     }
        //     console.log('File deleted successfully');
        // });

        // Return success response
        return res.status(200).json({
            message: 'Image uploaded to S3 successfully',
            // s3ImageUrl: s3ImageUrl
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: `An error occurred while uploading image: ${error.message}`,
        });
    }
};

module.exports = {
    s3ImageUploadToFrames
};