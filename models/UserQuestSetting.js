const mongoose = require("mongoose");
const { Schema } = mongoose;
const shortLink = require("shortlink");

const UserQuestSetting = mongoose.Schema(
  {
    userId: {
      // type: Schema.Types.ObjectId,
      // ref: "user",
      type: String
    },
    questId: {
      type: Schema.Types.ObjectId,
      ref: "InfoQuestQuestions",
    },
    link: {
      type: String,
      unique: true,
      default: shortLink.generate(8)
    },
    hidden: {
        type: Boolean,
        default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserQuestSetting", UserQuestSetting);
