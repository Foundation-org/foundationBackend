const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    // username: {
    //   type: String,
    //   unique: true,
    //   min: 3,
    //   max: 20,
    //   required: true,
    // },
    email: {
      type: String,
      unique: true,
      max: 50,
      required: true,
    },
    password: {
      type: String,
      min: 6,
      required: true,
    },
    gmailVerified: {
      type: Boolean,
      default: false,
    },
    metamaskVerified: {
      type: Boolean,
      default: false,
    },
    uuid: {
      type: String,
    },
    violationCounter:{
      type:Number,
    },
    walletAddr: {
      type: String,
    },
    signedUuid: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("user", userSchema);
