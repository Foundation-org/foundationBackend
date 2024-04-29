const express = require("express");
const router = express.Router();
// controller
const AwsController = require("../controller/AwsController");
const { uploadSingle } = require("../middleware/uploadSingle");


/**
 * @swagger
 * tags:
 *   name: AWS
 *   description: Endpoints for managing AWS
 */

/**
 * @swagger
 * /aws/s3ImageUploadToFrames:
 *   post:
 *     tags:
 *       - AWS
 *     summary: Upload image to S3 for Frames
 *     description: Endpoint to upload an image to S3 for Frames
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       '200':
 *         description: Image uploaded successfully
 *       '400':
 *         description: Bad request - no file uploaded or uploaded file is not an image
 *       '500':
 *         description: Internal server error
 */
router.post(
    "/s3ImageUploadToFrames",
    uploadSingle,
    AwsController.s3ImageUploadToFrames
);




module.exports = router;
