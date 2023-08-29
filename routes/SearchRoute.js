const route = require("express").Router();

const InfoQuestQuestions = require("../models/InfoQuestQuestions");

// SIGN UP
route.post("/easySearch", async (req, res) => {
//   const searchTerm = req.query.term;
  const searchTerm = "like";
  try {
    const results = await InfoQuestQuestions.find({
      Question: { $regex: searchTerm, $options: "i" },
    });

    res.status(200).json(results);

  } catch (err) {
    res.status(500).send("Not Created 2");
  }
});

module.exports = route;
