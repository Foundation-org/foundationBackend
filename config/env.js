require("dotenv").config();

module.exports = {
    OPEN_AI_URL: process.env.OPEN_AI_URL,
    OPEN_AI_KEY: process.env.OPEN_AI_KEY,
    JWT_SECRET: process.env.JWT_SECRET,
    CLIENT_ID: process.env.CLIENT_ID,
  };