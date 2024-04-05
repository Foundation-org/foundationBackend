const express = require("express");
const router = express.Router();
// controller
const OtpController = require("../controller/OtpController");
// middleware
const protect = require("../middleware/protect");

router.post("/sendOtp", OtpController.sendOtp);

router.post("/verifyOtp", OtpController.verifyOtp);

router.post("/resendOtp", OtpController.resendOtp);

module.exports = router;
