const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  state_province: {
    type: String,
  },
});

module.exports = mongoose.model("companies", companySchema);
