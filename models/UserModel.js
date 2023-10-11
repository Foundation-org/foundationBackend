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
      default:0,
    },
    walletAddr: {
      type: String,
    },
    signedUuid: {
      type: String,
    },
    contentionsOnAddedAns: {
      type: Number,
      default: 0,
    },
    selectionsOnAddedAns: {
      type: Number,
      default: 0,
    },
    questsCreated: {
      type: Number,
      default: 0,
    },
    contentionsGiven: {
      type: Number,
      default: 0,
    },
    usersAnswered: {
      type: Number,
      default: 0,
    },
    addedAnswers: {
      type: Number,
      default: 0,
    },
    changedAnswers: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("user", userSchema);
