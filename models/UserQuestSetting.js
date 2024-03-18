const mongoose = require("mongoose");
const { Schema } = mongoose;
// const shortLink = require("shortlink");

const UserQuestSetting = mongoose.Schema(
  {
    Question: { type: String},
    uuid: {
      // type: Schema.Types.ObjectId,
      // ref: "user",
      type: String
    },
    questForeignKey: {
      // type: Schema.Types.ObjectId,
      // ref: "InfoQuestQuestions",
      type: String,
    },
    link: {
      type: String,
      default: ""
      // default: shortLink.generate(8)
    },
    data: {
      type: Array,
    },
    linkStatus: {
      type: String,
      enum: ["Enable", "Disable", "Delete", ""],
      default: ""
    },
    hidden: {
        type: Boolean,
        default: false
    },
    hiddenMessage: {
      type: String,
      default: ""
    },
    questImpression: {
      type: Number,
      default: 0,
    },
    questsCompleted: {
      type: Number,
      default: 0,
    },
    result: {
      type: Array,
      // default: [{ answer: {}, contended: {} }],
      default: undefined,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserQuestSetting", UserQuestSetting);
