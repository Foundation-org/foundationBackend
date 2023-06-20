const route = require("express").Router();

const InfoQuestQuestions = require("../models/InfoQuestQuestions");

// SIGN UP
route.post("/createInfoQuestQuest", async (req, res) => {
  try {
    const question = await new InfoQuestQuestions({
      Question: req.body.Question,
      QuestionCorrect: req.body.QuestionCorrect,
      whichTypeQuestion: req.body.whichTypeQuestion,
      QuestAnswers: req.body.QuestAnswers === undefined ? []: req.body.QuestAnswers,
      QuestAnswersSelected: req.body.QuestAnswersSelected === undefined ? []: req.body.QuestAnswersSelected,
      walletAddr: req.body.walletAddr,
    });

    const questions = await question.save();
    !questions && res.status(404).send("Not Created 1");

    res.status(201).send("Quest has been Created");
  } catch (err) {
    res.status(500).send("Not Created 2");
  }
});

// Get all questions of user have
route.post("/getAllQuests", async (req, res) => {
  try {
    const Questions = await InfoQuestQuestions.find();
    res.status(200).json(Questions);
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = route;
