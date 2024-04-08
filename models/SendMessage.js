const mongoose = require("mongoose");

const SendMessage = mongoose.Schema(
  {
    from: String,
    to: String,
    message: String,
    send: { type: Boolean, default: true },
    fail: { type: Boolean, default: false },
    view: { type: Number, default: 0 },
    unView: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("sendMessage", SendMessage);
