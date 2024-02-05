const mongoose = require("mongoose");
const InfoQuestQuestions = require("../models/InfoQuestQuestions");

const columnsSchema = {
  id: String,
  list: Array,
};

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
      // required: true,
    },
    password: {
      type: String,
      min: 6,
      // required: true,
    },
    isGuestMode: {
      type: Boolean,
      // default: false
    },
    gmailVerified: {
      type: Boolean,
      default: false,
    },
    verification:{
      type: Boolean,
      default: false,
    },
    referral:{
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
    States: {
      expandedView: Boolean,
      searchData: String,
      filterByStatus: String,
      filterByType: String,
      filterByScope: String,
      filterBySort: String,
      columns: {
        All: columnsSchema,
        Preferences: columnsSchema,
        Block: columnsSchema,
      },
      clearFilter: Boolean,
    },
    violationCounter: {
      type: Number,
      default: 0,
    },
    balance: {
      type: Number,
      default: 0.00,
    },
    walletAddr: {
      type: String,
    },
    signedUuid: {
      type: String,
    },
    requiredAction: {
      type: Boolean,
      default: false
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
    correctedAnswers: {
      type: Number,
      default: 0,
    },
    wrongedAnswers: {
      type: Number,
      default: 0,
    },
    createdQuests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: InfoQuestQuestions,
      },
    ],
    completedQuests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: InfoQuestQuestions,
      },
    ],
    badges: [
      {
        accountId: { type: String },
        accountName: { type: String },
        isVerified: { type: Boolean },
        type: { type: String },
        createdAt: { type: Date, default: new Date() }
      }
    ],
    role: {
      type: String,
      enum: ['guest', 'user'],
      default: 'guest',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("user", userSchema);
