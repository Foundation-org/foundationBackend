const mongoose = require("mongoose");

const ReceiveMessage = mongoose.Schema(
  {
    sender: String,
    receiver: String,
    subject: String,
    shortMessage: String,
    viewed: { type: Boolean, default: false },
    senderMessageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'sendMessage'
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("receiveMessage", ReceiveMessage);
