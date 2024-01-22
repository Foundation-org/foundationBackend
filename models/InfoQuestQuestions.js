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
    // startQuestData: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "StartQuests",
    // },
  },
  { timestamps: true }
);

module.exports = mongoose.model("InfoQuestQuestions", InfoQuestQuestionsSchema);
