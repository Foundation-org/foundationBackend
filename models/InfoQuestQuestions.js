const mongoose = require("mongoose");

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
    QuestAnswers: {
      type: Array,
    },
    QuestAnswersSelected: {
      type: Array,
    },
    uuid: {
      type: String,
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
  },
  { timestamps: true }
);

module.exports = mongoose.model("InfoQuestQuestions", InfoQuestQuestionsSchema);