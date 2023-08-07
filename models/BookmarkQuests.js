const mongoose = require("mongoose");

const BookmarkQuestsSchema = mongoose.Schema(
  {
    Question: {
      type: String,
      required: true,
    },
    uuid: {
      type: String,
    },
    questForeignKey: {
      type: String,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("BookmarkQuests", BookmarkQuestsSchema);


