const mongoose = require("mongoose");
const Users = require("../models/UserModel");

const InfoQuestQuestionsSchema = mongoose.Schema(
  {
    Question: {
      type: String,
      required: true,
    },
    whichTypeQuestion: {
      type: String,
      required: true,
    },
    QuestionCorrect: {
      type: String,
      required: true,
    },
    QuestTopic: {
      type: String,
    },
    QuestAnswers: {
      type: Array,
    },
    QuestAnswersSelected: {
      type: Array,
    },
    uuid: {
      type: String,
    },
    getUserBadge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user'
    },
    usersAddTheirAns: {
      type: Boolean,
    },
    usersChangeTheirAns: {
      type: String,
    },
    userCanSelectMultiple: {
      type: Boolean,
    },
    startStatus: {
      type: String,
      default: "",
    },
    lastInteractedAt: {
      type: Date,
      default: "",
    },
    interactingCounter: {
      type: Number,
      default: 0,
    },
    totalStartQuest: {
      type: Number,
      default: 0,
    },
    result: {
      type: Array,
      // default: [{ answer: {}, contended: {} }],
      default: undefined,
    },
    startQuestData: {
      type: Object,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("InfoQuestQuestions", InfoQuestQuestionsSchema);
