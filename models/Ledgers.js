const mongoose = require("mongoose");

const Ledgers = mongoose.Schema(
  {
    uuid: { type: String },
    txUserAction: { type: String, required: true },
    txID: { type: String, required: true },
    txAuth: { type: String, required: true },
    txFrom: { type: String, required: true },
    txTo: { type: String, required: true },
    txAmount: { type: Number, required: true },
    txData: { type: mongoose.Schema.Types.Mixed }, // Assuming data can be of any type
    txDate: { type: Date, default: Date.now },
    txDescription: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ledgers", Ledgers);
