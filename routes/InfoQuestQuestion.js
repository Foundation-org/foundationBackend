const route = require("express").Router();

const InfoQuestQuestions = require("../models/InfoQuestQuestions");
const StartQuests = require("../models/StartQuests");

// SIGN UP
route.post("/createInfoQuestQuest", async (req, res) => {
  try {
    const question = await new InfoQuestQuestions({
      Question: req.body.Question,
      QuestionCorrect: req.body.QuestionCorrect,
      whichTypeQuestion: req.body.whichTypeQuestion,
      QuestAnswers:
        req.body.QuestAnswers === undefined ? [] : req.body.QuestAnswers,
      QuestAnswersSelected:
        req.body.QuestAnswersSelected === undefined
          ? []
          : req.body.QuestAnswersSelected,
      uuid: req.body.uuid,
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

// Get all questions of user have with status Default
route.post("/getAllQuestsWithDefaultStatus", async (req, res) => {
  try {
    const allQuestions = await InfoQuestQuestions.find();

    if (req.body.uuid === "" || req.body.uuid === undefined) {
      res.status(200).json(allQuestions);
    } else {
      const startedQuestions = await StartQuests.find({
        uuid: req.body.uuid,
        // uuid: "0x81597438fdd366b90971a73f39d56eea4702c43a",
      });

      let Result = [];
      await allQuestions.map(async function (rcrd) {
        await startedQuestions.map(function (rec) {
          console.log("111111111111111111111", rcrd);
          console.log("222222222222222222222", rec);
          if (rec.questForeignKey === rcrd._id.toString()) {
            console.log("matched", rcrd);
            if (
              rcrd.QuestionCorrect === "Not Selected" ||
              rcrd.whichTypeQuestion === "ranked choise"
            ) {
              rcrd.startStatus = "change answer";
            } else {
              rcrd.startStatus = "completed";
            }
          }
        });

        Result.push(rcrd);
      });

      res.status(200).json(Result);
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

// Get all questions of user have with status Not Answer Yet
route.post("/getAllQuestsWithOpenInfoQuestStatus", async (req, res) => {
  try {
    const allQuestions = await InfoQuestQuestions.find();

    if (req.body.uuid === "" || req.body.uuid === undefined) {
      res.status(200).json(allQuestions);
    } else {
      const startedQuestions = await StartQuests.find({
        uuid: req.body.uuid,
        // uuid: "0x81597438fdd366b90971a73f39d56eea4702c43a",
      });

      let Result = [];
      await allQuestions.map(async function (rcrd) {
        let startedOrNot = false;
        await startedQuestions.map(function (rec) {
          if (rec.questForeignKey === rcrd._id.toString()) {
            startedOrNot = true;
          }
        });
        if (startedOrNot === false) {
          Result.push(rcrd);
        }
      });

      res.status(200).json(Result);
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

// Get all questions of user have with status with completed status
route.post("/getAllQuestsWithCompletedStatus", async (req, res) => {
  try {
    const allQuestions = await InfoQuestQuestions.find();

    if (req.body.uuid === "" || req.body.uuid === undefined) {
      res.status(200).json(allQuestions);
    } else {
      const startedQuestions = await StartQuests.find({
        uuid: req.body.uuid,
        // uuid: "0x81597438fdd366b90971a73f39d56eea4702c43a",
      });

      let Result = [];
      await allQuestions.map(async function (rcrd) {
        let startedOrNot = false;
        await startedQuestions.map(function (rec) {
          if (rec.questForeignKey === rcrd._id.toString()) {

            if (
              rcrd.QuestionCorrect === "Not Selected" ||
              rcrd.whichTypeQuestion === "ranked choise"
            ) {
            } else {
              startedOrNot = true;
            }
          }
        });
        if (startedOrNot === true) {
          // if (rcrd.QuestionCorrect === "Not Selected") {
          rcrd.startStatus = "completed";
          Result.push(rcrd);
          // }
        }
      });

      res.status(200).json(Result);
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

// Get all questions of user have with status Change answer
route.post("/getAllQuestsWithChangeAnsStatus", async (req, res) => {
  try {
    const allQuestions = await InfoQuestQuestions.find();

    if (req.body.uuid === "" || req.body.uuid === undefined) {
      res.status(200).json(allQuestions);
    } else {
      const startedQuestions = await StartQuests.find({
        uuid: req.body.uuid,
        // uuid: "0x81597438fdd366b90971a73f39d56eea4702c43a",
      });

      let Result = [];
      await allQuestions.map(async function (rcrd) {
        let startedOrNot = false;
        await startedQuestions.map(function (rec) {
          if (rec.questForeignKey === rcrd._id.toString()) {
            startedOrNot = true;
          }
        });
        if (startedOrNot === true) {
          // if (rcrd.QuestionCorrect === "Not Selected") {
          if (rcrd.QuestionCorrect === "Not Selected" ||
          rcrd.whichTypeQuestion === "ranked choise") {
            rcrd.startStatus = "change answer";
            Result.push(rcrd);
            // }
          }
        }
      });

      res.status(200).json(Result);
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = route;
