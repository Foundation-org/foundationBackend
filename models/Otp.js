const mongoose = require("mongoose");

const Otp = mongoose.Schema(
  {
    phoneNumber: String,
    otp: String,
    createdAt: { type: Date, expires: 600, default: Date.now } // OTP expires in 10 minutes
  }
);

module.exports = mongoose.model("otp", Otp);
