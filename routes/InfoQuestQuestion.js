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

// Get all questions of user have with status Default
// route.post("/getAllQuestsWithDefaultStatus", async (req, res) => {
//   try {
//     const allQuestions = await InfoQuestQuestions.find();

//     if (req.body.uuid === "" || req.body.uuid === undefined) {
//       res.status(200).json(allQuestions);
//     } else {
//       const startedQuestions = await StartQuests.find({
//         uuid: req.body.uuid,
//         // uuid: "0x81597438fdd366b90971a73f39d56eea4702c43a",
//       });

//       let Result = [];
//       await allQuestions.map(async function (rcrd) {
//         await startedQuestions.map(function (rec) {
//           console.log("111111111111111111111", rcrd);
//           console.log("222222222222222222222", rec);
//           if (rec.questForeignKey === rcrd._id.toString()) {
//             console.log("matched", rcrd);
//             if (
//               rcrd.QuestionCorrect === "Not Selected" ||
//               rcrd.whichTypeQuestion === "ranked choise"
//             ) {
//               rcrd.startStatus = "change answer";
//             } else {
//               // rcrd.startStatus = "completed";


//             }
//           }
//         });

//         Result.push(rcrd);
//       });

//       res.status(200).json(Result);
//     }
//   } catch (err) {
//     res.status(500).send(err);
//   }
// });

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
              if (rcrd.whichTypeQuestion === "yes/no" || rcrd.whichTypeQuestion === "agree/disagree") {
                const selectedAnswers1 = rec.data[rec.data.length - 1].selected.toLowerCase().trim();
                const selectedAnswers2 = rcrd.QuestionCorrect.toLowerCase().trim();

                const isCorrect = JSON.stringify(selectedAnswers1) === JSON.stringify(selectedAnswers2);

                if (!isCorrect) {
                  rcrd.startStatus = "incorrect";
                }
                else {
                  rcrd.startStatus = "correct";
                }
              }
              else {
                const selectedAnswers1 = rec.data[rec.data.length - 1].selected.map(item => item.question.toLowerCase().trim());
                const selectedAnswers2 = rcrd.QuestAnswersSelected.map(item => item.answers.toLowerCase().trim());
                selectedAnswers1.sort();
                selectedAnswers2.sort();

                const isCorrect = JSON.stringify(selectedAnswers1) === JSON.stringify(selectedAnswers2);

                if (!isCorrect) {
                  rcrd.startStatus = "incorrect";
                }
                else {
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




// Get all questions of user have with status Not Answer Yet
route.post("/getAllQuestsWithDefaultStatus", async (req, res) => {
  const allQuestions = await InfoQuestQuestions.find();
  const result = await getQuestionsWithStatus(allQuestions,req.body.uuid);
  res.status(200).json(result);
});

// Get all questions of user have with status with completed status
route.post("/getAllQuestsWithCorrectStatus", async (req, res) => {
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
              // rcrd.startStatus = "completed";
              if (rcrd.whichTypeQuestion === "yes/no" || rcrd.whichTypeQuestion === "agree/disagree") {
                const selectedAnswers1 = rec.data[rec.data.length - 1].selected.toLowerCase().trim();
                const selectedAnswers2 = rcrd.QuestionCorrect.toLowerCase().trim();

                const isCorrect = JSON.stringify(selectedAnswers1) === JSON.stringify(selectedAnswers2);

                // Update the startStatus based on whether answers are correct or not

                if (isCorrect) {
                  rcrd.startStatus = "correct";
                  Result.push(rcrd);
                }
              }
              else {

                const selectedAnswers1 = rec.data[rec.data.length - 1].selected.map(item => item.question.toLowerCase().trim());
                const selectedAnswers2 = rcrd.QuestAnswersSelected.map(item => item.answers.toLowerCase().trim());
                selectedAnswers1.sort();
                selectedAnswers2.sort();

                // Compare the selected answers
                const isCorrect = JSON.stringify(selectedAnswers1) === JSON.stringify(selectedAnswers2);

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

      res.status(200).json(Result);
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

route.post("/getAllQuestsWithIncorrectStatus", async (req, res) => {
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
          if (rec.questForeignKey === rcrd._id.toString()) {

            if (
              rcrd.QuestionCorrect === "Not Selected" ||
              rcrd.whichTypeQuestion === "ranked choise"
            ) {
            } else {
              // rcrd.startStatus = "completed";
              if (rcrd.whichTypeQuestion === "yes/no" || rcrd.whichTypeQuestion === "agree/disagree") {
                const selectedAnswers1 = rec.data[rec.data.length - 1].selected.toLowerCase().trim();
                const selectedAnswers2 = rcrd.QuestionCorrect.toLowerCase().trim();

                const isCorrect = JSON.stringify(selectedAnswers1) === JSON.stringify(selectedAnswers2);

                // Update the startStatus based on whether answers are correct or not

                if (!isCorrect) {
                  rcrd.startStatus = "incorrect";
                  Result.push(rcrd);
                }
              }
              else {

                const selectedAnswers1 = rec.data[rec.data.length - 1].selected.map(item => item.question.toLowerCase().trim());
                const selectedAnswers2 = rcrd.QuestAnswersSelected.map(item => item.answers.toLowerCase().trim());
                selectedAnswers1.sort();
                selectedAnswers2.sort();

                // Compare the selected answers
                const isCorrect = JSON.stringify(selectedAnswers1) === JSON.stringify(selectedAnswers2);

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

// Get all questions In the accending order
route.post("/getAllQuestsWithTheNewestOnes", async (req, res) => {
  try {
    // const oldestRecords = await InfoQuestQuestions.find().sort('date').limit(10);
    const newestRecords = await InfoQuestQuestions.find().sort('createdAt');
    const result = await getQuestionsWithStatus(newestRecords,req.body.uuid);
  res.status(200).json(result);

    
  } catch (error) {
    console.error('Error fetching newest records:', error);
    res.status(500).json({ error: 'Database error' });
    const result = await getQuestionsWithStatus(allQuestions,req.body.uuid);
  res.status(200).json(result);
  }
});

// Get all questions In the deccending order
route.post("/getAllQuestsWithTheOldestOnes", async (req, res) => {
  try {
    // const oldestRecords = await InfoQuestQuestions.find().sort('date').limit(10);
    const oldestRecords = await InfoQuestQuestions.find().sort({ createdAt: -1 });
    const result = await getQuestionsWithStatus(oldestRecords,req.body.uuid);
  res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching oldest records:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get all questions last updated
route.post("/getAllQuestsWithTheLastUpdatedOnes", async (req, res) => {
  try {
    // const oldestRecords = await InfoQuestQuestions.find().sort('date').limit(10);
    const updatedRecords = await InfoQuestQuestions.find().sort({ updatedAt: -1 });
    const result = await getQuestionsWithStatus(updatedRecords,req.body.uuid);
  res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching recently updated records:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = route;