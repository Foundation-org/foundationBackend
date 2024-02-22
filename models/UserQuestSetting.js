const mongoose = require("mongoose");
const { Schema } = mongoose;
const shortLink = require("shortlink");

const UserQuestSetting = mongoose.Schema(
  {
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
      unique: true,
      default: shortLink.generate(8)
    },
    hidden: {
        type: Boolean,
        default: false
    },
    hiddenMessage: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserQuestSetting", UserQuestSetting);
