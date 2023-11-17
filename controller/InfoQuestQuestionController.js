const InfoQuestQuestions = require("../models/InfoQuestQuestions");
const StartQuests = require("../models/StartQuests");
const User = require("../models/UserModel");
const { createLedger } = require("../utils/createLedger");
const crypto = require("crypto");

const createInfoQuestQuest = async (req, res) => {
    try {
      const question = await new InfoQuestQuestions({
        Question: req.body.Question,
        QuestionCorrect: req.body.QuestionCorrect,
        whichTypeQuestion: req.body.whichTypeQuestion,
        usersAddTheirAns: req.body.usersAddTheirAns || false,
        usersChangeTheirAns: req.body.usersChangeTheirAns,
        QuestAnswers:
          req.body.QuestAnswers === undefined ? [] : req.body.QuestAnswers,
        QuestAnswersSelected:
          req.body.QuestAnswersSelected === undefined
            ? []
            : req.body.QuestAnswersSelected,
        uuid: req.body.uuid,
      });
  
      const createdQuestion = await question.save();
      if (!createdQuestion) {
        return res.status(404).send("Not Created 1");
      }
  
      // Find the user by uuid
      const user = await User.findOne({ uuid: req.body.uuid });
  
      if (!user) {
        return res.status(404).send("User not found");
      }
  
      // Increment the questsCreated field by one
      user.questsCreated += 1;
  
      // Push the ID of the created question into the createdQuests array
      user.createdQuests.push(createdQuestion._id);
      // await User.findOneAndUpdate(
      //   { uuid: req.body.uuid },
      //   {
      //     $push: { createdQuests: createdQuestion._id },
      //   }
      // );
  
      // Save the updated user object
      await user.save();
  
      // Create Ledger
      await createLedger(
        {
          uuid : user.uuid,
          txUserAction : "questCreated",
          txID : crypto.randomBytes(11).toString("hex"),
          txAuth : "User",
          txFrom : user.uuid,
          txTo : "dao",
          txAmount : "0",
          txData : createdQuestion._id,
          // txDescription : "User creates a new quest"
        })
  
      res.status(201).json({ message: "Quest has been Created", questID: createdQuestion._id });
    } catch (err) {
      res.status(500).send("Not Created 2" + err.message);
    }
  }
const constraintForUniqueQuestion = async (req, res) => {
    try {
      // Get the question from the query parameters and convert it to lowercase
      const queryQuestion = req.query.question.toLowerCase();
  
      // Check for a matching question in a case-insensitive manner
      const matchingQuestion = await InfoQuestQuestions.findOne({
        Question: { $regex: new RegExp(queryQuestion, "i") },
      });
  
      if (matchingQuestion) {
        // If a matching question is found, it's not unique
        return res.status(200).json({ isUnique: false });
      }
  
      // If no matching question is found, it's unique
      return res.status(200).json({ isUnique: true });
    } catch (error) {
      console.error(error);
      return res.status(500).send("Internal Server Error");
    }
  }
const getAllQuests = async (req, res) => {
    try {
      const Questions = await InfoQuestQuestions.find();
      res.status(200).json(Questions);
    } catch (err) {
      res.status(500).send(err);
    }
  }
const getAllQuestsWithOpenInfoQuestStatus = async (req, res) => {
    try {
      let allQuestions;
      // Add the uuid condition to the filter object if filter is true
      let filterObj = {};
      if (req.body.filter === true) {
        filterObj.uuid = req.body.uuid;
      }
  
      // Add the type condition to the filter object if type is sent from the frontend
      if (req.body.type) {
        filterObj.whichTypeQuestion = req.body.type;
      }
      // Query the database with skip and limit options to get questions for the first page
      allQuestions = await InfoQuestQuestions.find(filterObj).sort(
        req.body.sort === "Newest First"
          ? { createdAt: -1 }
          : req.body.sort === "Last Updated"
          ? { lastInteractedAt: -1 }
          : req.body.sort === "Most Popular"
          ? { interactingCounter: -1 }
          : "createdAt"
      ); // Sort by createdAt field in descending order
  
      if (req.body.uuid === "" || req.body.uuid === undefined) {
        res.status(200).json(allQuestions);
      } else {
        let Result = [];
        const startedQuestions = await StartQuests.find({
          uuid: req.body.uuid,
          // uuid: "0x81597438fdd366b90971a73f39d56eea4702c43a",
        });
  
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
        const start = req.body.start;
        const end = req.body.end;
        console.log("Start" + start + "end" + end);
  
        res.status(200).json({
          data: Result.slice(start, end),
          message: Result.length,
          // You can include other properties here if needed
        });
      }
    } catch (err) {
      res.status(500).send(err);
    }
  }
const getAllQuestsWithAnsweredStatus = async (req, res) => {
    try {
      let allQuestions;
      // Add the uuid condition to the filter object if filter is true
      let filterObj = {};
      if (req.body.filter === true) {
        filterObj.uuid = req.body.uuid;
      }
  
      // Add the type condition to the filter object if type is sent from the frontend
      if (req.body.type) {
        filterObj.whichTypeQuestion = req.body.type;
      }
      // Query the database with skip and limit options to get questions for the first page
      allQuestions = await InfoQuestQuestions.find(filterObj).sort(
        req.body.sort === "Newest First"
          ? { createdAt: -1 }
          : req.body.sort === "Last Updated"
          ? { lastInteractedAt: -1 }
          : req.body.sort === "Most Popular"
          ? { interactingCounter: -1 }
          : "createdAt"
      );
  
      if (req.body.uuid === "" || req.body.uuid === undefined) {
        res.status(200).json(allQuestions);
      } else {
        let Records = [];
        const startedQuestions = await StartQuests.find({
          uuid: req.body.uuid,
          // uuid: "0x81597438fdd366b90971a73f39d56eea4702c43a",
        });
  
        await allQuestions.map(async function (rcrd) {
          let startedOrNot = false;
          await startedQuestions.map(function (rec) {
            if (rec.questForeignKey === rcrd._id.toString()) {
              startedOrNot = true;
            }
          });
          if (startedOrNot === true) {
            Records.push(rcrd);
          }
        });
  
        let Result = [];
        await Records.map(async function (rcrd) {
          await startedQuestions.map(function (rec) {
            if (rec.questForeignKey === rcrd._id.toString()) {
              if (
                rcrd.QuestionCorrect === "Not Selected" ||
                rcrd.whichTypeQuestion === "ranked choise"
              ) {
                rcrd.startStatus = "change answer";
              } else {
                if (
                  rcrd.whichTypeQuestion === "yes/no" ||
                  rcrd.whichTypeQuestion === "agree/disagree"
                ) {
                  const selectedAnswers1 = rec.data[rec.data.length - 1].selected
                    .toLowerCase()
                    .trim();
                  const selectedAnswers2 =
                    rcrd.QuestionCorrect.toLowerCase().trim();
  
                  const isCorrect =
                    JSON.stringify(selectedAnswers1) ===
                    JSON.stringify(selectedAnswers2);
  
                  if (!isCorrect) {
                    rcrd.startStatus = "incorrect";
                  } else {
                    rcrd.startStatus = "correct";
                  }
                } else {
                  const selectedAnswers1 = rec.data[
                    rec.data.length - 1
                  ].selected.map((item) => item.question.toLowerCase().trim());
                  const selectedAnswers2 = rcrd.QuestAnswersSelected.map((item) =>
                    item.answers.toLowerCase().trim()
                  );
                  selectedAnswers1.sort();
                  selectedAnswers2.sort();
  
                  const isCorrect =
                    JSON.stringify(selectedAnswers1) ===
                    JSON.stringify(selectedAnswers2);
  
                  if (!isCorrect) {
                    rcrd.startStatus = "incorrect";
                  } else {
                    rcrd.startStatus = "correct";
                  }
                }
              }
            }
          });
  
          Result.push(rcrd);
        });
  
        const start = req.body.start;
        const end = req.body.end;
        console.log("Start" + start + "end" + end);
  
        res.status(200).json({
          data: Result.slice(start, end),
          message: Result.length,
          // You can include other properties here if needed
        });
      }
    } catch (err) {
      res.status(500).send(err);
    }
  }

const getAllQuestsWithDefaultStatus = async (req, res) => {
    const { uuid, _page, _limit, filter, sort, type } = req.body;
    const page = parseInt(_page);
    const pageSize = parseInt(_limit);
  
    // Calculate the number of documents to skip to get to the desired page
    const skip = (page - 1) * pageSize;
    let allQuestions = [];
    let filterObj = {};
  
    // Add the uuid condition to the filter object if filter is true
    if (filter === true) {
      filterObj.uuid = uuid;
    }
  
    // Add the type condition to the filter object if type is sent from the frontend
    if (type) {
      filterObj.whichTypeQuestion = type;
    }
    // Query the database with skip and limit options to get questions for the first page
    allQuestions = await InfoQuestQuestions.find(filterObj)
  
      .sort(
        sort === "Newest First"
          ? { createdAt: -1 }
          : sort === "Last Updated"
          ? { lastInteractedAt: -1 }
          : req.body.sort === "Most Popular"
          ? { interactingCounter: -1 }
          : "createdAt"
      ) // Sort by createdAt field in descending order
  
      .skip(skip)
      .limit(pageSize);
  
    const result = await getQuestionsWithStatus(allQuestions, uuid);
  
    res.status(200).json(result);
  }
const getAllQuestsWithCorrectStatus = async (req, res) => {
    try {
      let allQuestions;
      // Add the uuid condition to the filter object if filter is true
      let filterObj = {};
      if (req.body.filter === true) {
        filterObj.uuid = req.body.uuid;
      }
  
      // Add the type condition to the filter object if type is sent from the frontend
      if (req.body.type) {
        filterObj.whichTypeQuestion = req.body.type;
      }
      // Query the database with skip and limit options to get questions for the first page
      allQuestions = await InfoQuestQuestions.find(filterObj).sort(
        req.body.sort === "Newest First"
          ? { createdAt: -1 }
          : req.body.sort === "Last Updated"
          ? { lastInteractedAt: -1 }
          : req.body.sort === "Most Popular"
          ? { interactingCounter: -1 }
          : "createdAt"
      ); // Sort by createdAt field in descending order
  
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
                // rcrd.startStatus = "completed";
                if (
                  rcrd.whichTypeQuestion === "yes/no" ||
                  rcrd.whichTypeQuestion === "agree/disagree"
                ) {
                  const selectedAnswers1 = rec.data[rec.data.length - 1].selected
                    .toLowerCase()
                    .trim();
                  const selectedAnswers2 =
                    rcrd.QuestionCorrect.toLowerCase().trim();
  
                  const isCorrect =
                    JSON.stringify(selectedAnswers1) ===
                    JSON.stringify(selectedAnswers2);
  
                  // Update the startStatus based on whether answers are correct or not
  
                  if (isCorrect) {
                    rcrd.startStatus = "correct";
                    Result.push(rcrd);
                  }
                } else {
                  const selectedAnswers1 = rec.data[
                    rec.data.length - 1
                  ].selected.map((item) => item.question.toLowerCase().trim());
                  const selectedAnswers2 = rcrd.QuestAnswersSelected.map((item) =>
                    item.answers.toLowerCase().trim()
                  );
                  selectedAnswers1.sort();
                  selectedAnswers2.sort();
  
                  // Compare the selected answers
                  const isCorrect =
                    JSON.stringify(selectedAnswers1) ===
                    JSON.stringify(selectedAnswers2);
  
                  // Update the startStatus based on whether answers are correct or not
  
                  if (isCorrect) {
                    rcrd.startStatus = "correct";
                    Result.push(rcrd);
                  }
                }
              }
            }
          });
        });
        const start = req.body.start;
        const end = req.body.end;
        console.log("Start" + start + "end" + end);
  
        res.status(200).json({
          data: Result.slice(start, end),
          message: Result.length,
          // You can include other properties here if needed
        });
      }
    } catch (err) {
      res.status(500).send(err);
    }
  }
const getAllQuestsWithIncorrectStatus = async (req, res) => {
    try {
      // Query the database with skip and limit options to get questions for the current page
      let allQuestions;
      // Add the uuid condition to the filter object if filter is true
      let filterObj = {};
      if (req.body.filter === true) {
        filterObj.uuid = req.body.uuid;
      }
  
      // Add the type condition to the filter object if type is sent from the frontend
      if (req.body.type) {
        filterObj.whichTypeQuestion = req.body.type;
      }
      // Query the database with skip and limit options to get questions for the first page
      allQuestions = await InfoQuestQuestions.find(filterObj).sort(
        req.body.sort === "Newest First"
          ? { createdAt: -1 }
          : req.body.sort === "Last Updated"
          ? { lastInteractedAt: -1 }
          : req.body.sort === "Most Popular"
          ? { interactingCounter: -1 }
          : "createdAt"
      ); // Sort by createdAt field in descending order
  
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
            if (rec.questForeignKey === rcrd._id.toString()) {
              if (
                rcrd.QuestionCorrect === "Not Selected" ||
                rcrd.whichTypeQuestion === "ranked choise"
              ) {
              } else {
                // rcrd.startStatus = "completed";
                if (
                  rcrd.whichTypeQuestion === "yes/no" ||
                  rcrd.whichTypeQuestion === "agree/disagree"
                ) {
                  const selectedAnswers1 = rec.data[rec.data.length - 1].selected
                    .toLowerCase()
                    .trim();
                  const selectedAnswers2 =
                    rcrd.QuestionCorrect.toLowerCase().trim();
  
                  const isCorrect =
                    JSON.stringify(selectedAnswers1) ===
                    JSON.stringify(selectedAnswers2);
  
                  // Update the startStatus based on whether answers are correct or not
  
                  if (!isCorrect) {
                    rcrd.startStatus = "incorrect";
                    Result.push(rcrd);
                  }
                } else {
                  const selectedAnswers1 = rec.data[
                    rec.data.length - 1
                  ].selected.map((item) => item.question.toLowerCase().trim());
                  const selectedAnswers2 = rcrd.QuestAnswersSelected.map((item) =>
                    item.answers.toLowerCase().trim()
                  );
                  selectedAnswers1.sort();
                  selectedAnswers2.sort();
  
                  // Compare the selected answers
                  const isCorrect =
                    JSON.stringify(selectedAnswers1) ===
                    JSON.stringify(selectedAnswers2);
  
                  // Update the startStatus based on whether answers are correct or not
  
                  if (!isCorrect) {
                    rcrd.startStatus = "incorrect";
                    Result.push(rcrd);
                  }
                }
              }
            }
          });
        });
  
        const start = req.body.start;
        const end = req.body.end;
        console.log("Start" + start + "end" + end);
        res.status(200).json({
          data: Result.slice(start, end),
          message: Result.length,
          // You can include other properties here if needed
        });
      }
    } catch (err) {
      res.status(500).send(err);
    }
  }
const getAllQuestsWithChangeAnsStatus = async (req, res) => {
    try {
      // Query the database with skip and limit options to get questions for the current page
      let allQuestions;
      // Add the uuid condition to the filter object if filter is true
      let filterObj = {};
      if (req.body.filter === true) {
        filterObj.uuid = req.body.uuid;
      }
  
      // Add the type condition to the filter object if type is sent from the frontend
      if (req.body.type) {
        filterObj.whichTypeQuestion = req.body.type;
      }
      // Query the database with skip and limit options to get questions for the first page
      allQuestions = await InfoQuestQuestions.find(filterObj).sort(
        req.body.sort === "Newest First"
          ? { createdAt: -1 }
          : req.body.sort === "Last Updated"
          ? { lastInteractedAt: -1 }
          : req.body.sort === "Most Popular"
          ? { interactingCounter: -1 }
          : "createdAt"
      ); // Sort by createdAt field in descending order
  
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
            if (
              rcrd.QuestionCorrect === "Not Selected" ||
              rcrd.whichTypeQuestion === "ranked choise"
            ) {
              rcrd.startStatus = "change answer";
              Result.push(rcrd);
            }
          }
        });
        const start = req.body.start;
        const end = req.body.end;
  
        res.status(200).json({
          data: Result.slice(start, end),
          message: Result.length,
          // You can include other properties here if needed
        });
      }
    } catch (err) {
      res.status(500).send(err);
    }
  }

async function getQuestionsWithStatus(allQuestions, uuid) {
    try {
      if (uuid === "" || uuid === undefined) {
        return allQuestions;
      } else {
        const startedQuestions = await StartQuests.find({
          uuid: uuid,
        });
  
        let Result = [];
        await allQuestions.map(async function (rcrd) {
          await startedQuestions.map(function (rec) {
            if (rec.questForeignKey === rcrd._id.toString()) {
              if (
                rcrd.QuestionCorrect === "Not Selected" ||
                rcrd.whichTypeQuestion === "ranked choise"
              ) {
                rcrd.startStatus = "change answer";
              } else {
                if (
                  rcrd.whichTypeQuestion === "yes/no" ||
                  rcrd.whichTypeQuestion === "agree/disagree"
                ) {
                  const selectedAnswers1 = rec.data[rec.data.length - 1].selected
                    .toLowerCase()
                    .trim();
                  const selectedAnswers2 =
                    rcrd.QuestionCorrect.toLowerCase().trim();
  
                  const isCorrect =
                    JSON.stringify(selectedAnswers1) ===
                    JSON.stringify(selectedAnswers2);
  
                  if (!isCorrect) {
                    rcrd.startStatus = "incorrect";
                  } else {
                    rcrd.startStatus = "correct";
                  }
                } else {
                  const selectedAnswers1 = rec.data[
                    rec.data.length - 1
                  ].selected.map((item) => item.question.toLowerCase().trim());
                  const selectedAnswers2 = rcrd.QuestAnswersSelected.map((item) =>
                    item.answers.toLowerCase().trim()
                  );
                  selectedAnswers1.sort();
                  selectedAnswers2.sort();
  
                  const isCorrect =
                    JSON.stringify(selectedAnswers1) ===
                    JSON.stringify(selectedAnswers2);
  
                  if (!isCorrect) {
                    rcrd.startStatus = "incorrect";
                  } else {
                    rcrd.startStatus = "correct";
                  }
                }
              }
            }
          });
  
          Result.push(rcrd);
        });
  
        return Result;
      }
    } catch (err) {
      throw err;
    }
  }

module.exports = {
    createInfoQuestQuest,
    constraintForUniqueQuestion,
    getAllQuests,
    getAllQuestsWithOpenInfoQuestStatus,
    getAllQuestsWithAnsweredStatus,
    getAllQuestsWithDefaultStatus,
    getAllQuestsWithCorrectStatus,
    getAllQuestsWithIncorrectStatus,
    getAllQuestsWithChangeAnsStatus,
}