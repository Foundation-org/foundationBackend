const express = require("express");
const router = express.Router();
// controller
const InfoQuestQuestionController = require("../controller/InfoQuestQuestionController");
// middleware
const protect = require("../middleware/protect");


router.post("/createInfoQuestQuest", InfoQuestQuestionController.createInfoQuestQuest)
router.get("/constraintForUniqueQuestion", InfoQuestQuestionController.constraintForUniqueQuestion)
router.post("/getAllQuests", InfoQuestQuestionController.getAllQuests)
router.post("/getAllQuestsWithOpenInfoQuestStatus", InfoQuestQuestionController.getAllQuestsWithOpenInfoQuestStatus)
router.post("/getAllQuestsWithAnsweredStatus", InfoQuestQuestionController.getAllQuestsWithAnsweredStatus)
router.post("/getAllQuestsWithDefaultStatus", InfoQuestQuestionController.getAllQuestsWithDefaultStatus)
router.get("/getQuest/:id", InfoQuestQuestionController.getQuestById)
router.post("/getAllQuestsWithCompletedStatus", InfoQuestQuestionController.getAllQuestsWithCompletedStatus)
router.post("/getAllQuestsWithChangeAnsStatus", InfoQuestQuestionController.getAllQuestsWithChangeAnsStatus)

module.exports = router;


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



// Get all questions In the accending order
// route.post("/getAllQuestslastInteractedAt", async (req, res) => {
//   try {
//     const { uuid, _page, _limit, filter } = req.body;
//     const page = parseInt(_page) || 1; // Convert query param to integer, default to 1 if not provided
//     const pageSize = parseInt(_limit); // Convert query param to integer, default to 10 if not provided

//     // Calculate the number of documents to skip to get to the desired page
//     const skip = (page - 1) * pageSize;

//     // Query the database with skip and limit options to get questions for the first page
//     let newestRecords;
//     if (filter === true) {
//       newestRecords = await InfoQuestQuestions.find({ uuid: uuid })
//         .sort({ createdAt: -1 }) // Sort by createdAt field in descending order
//         .skip(skip)
//         .limit(pageSize);
//     } else {
//       newestRecords = await InfoQuestQuestions.find()
//         .sort({ createdAt: -1 }) // Sort by createdAt field in descending order
//         .skip(skip)
//         .limit(pageSize);
//     }
//     const result = await getQuestionsWithStatus(newestRecords, uuid);
//     res.status(200).json(result);
//   } catch (error) {
//     console.error("Error fetching newest records:", error);
//     res.status(500).json({ error: "Database error" });
//     const result = await getQuestionsWithStatus(allQuestions, uuid);

//     res.status(200).json(result);
//   }
// });
// route.post("/getAllQuestslastInteractedAt", async (req, res) => {
//   try {
//     const { uuid, _page, _limit, filter } = req.body;
//     const page = parseInt(_page) || 1; // Convert query param to integer, default to 1 if not provided
//     const pageSize = parseInt(_limit); // Convert query param to integer, default to 10 if not provided

//     // Calculate the number of documents to skip to get to the desired page
//     const skip = (page - 1) * pageSize;

//     // Query the database with skip and limit options to get questions for the first page
//     let newestRecords;
//     if (filter === true) {
//       newestRecords = await InfoQuestQuestions.find({ uuid: uuid })
//         .sort({ lastInteractedAt: -1 }) // Sort by createdAt field in descending order
//         .skip(skip)
//         .limit(pageSize);
//     } else {
//       newestRecords = await InfoQuestQuestions.find()
//         .sort({ lastInteractedAt: -1 }) // Sort by createdAt field in descending order
//         .skip(skip)
//         .limit(pageSize);
//     }
//     const result = await getQuestionsWithStatus(newestRecords, uuid);
//     res.status(200).json(result);
//   } catch (error) {
//     console.error("Error fetching newest records:", error);
//     res.status(500).json({ error: "Database error" });
//     const result = await getQuestionsWithStatus(allQuestions, uuid);

//     res.status(200).json(result);
//   }
// });

// Get all questions In the accending order
// route.post("/getAllQuestsWithTheNewestOnes", async (req, res) => {
//   try {
//     const { uuid, _page, _limit, filter } = req.body;
//     const page = parseInt(_page) || 1; // Convert query param to integer, default to 1 if not provided
//     const pageSize = parseInt(_limit); // Convert query param to integer, default to 10 if not provided

//     // Calculate the number of documents to skip to get to the desired page
//     const skip = (page - 1) * pageSize;

//     // Query the database with skip and limit options to get questions for the first page
//     let newestRecords;
//     if (filter === true) {
//       newestRecords = await InfoQuestQuestions.find({ uuid: uuid })
//         .sort({ createdAt: -1 }) // Sort by createdAt field in descending order
//         .skip(skip)
//         .limit(pageSize);
//     } else {
//       newestRecords = await InfoQuestQuestions.find()
//         .sort({ createdAt: -1 }) // Sort by createdAt field in descending order
//         .skip(skip)
//         .limit(pageSize);
//     }
//     const result = await getQuestionsWithStatus(newestRecords, uuid);
//     res.status(200).json(result);
//   } catch (error) {
//     console.error("Error fetching newest records:", error);
//     res.status(500).json({ error: "Database error" });
//     const result = await getQuestionsWithStatus(allQuestions, uuid);

//     res.status(200).json(result);
//   }
// });

// Get all questions In the deccending order
// route.post("/getAllQuestsWithTheOldestOnes", async (req, res) => {
//   try {
//     const { uuid, _page, _limit, filter } = req.body;
//     const page = parseInt(_page) || 1; // Convert query param to integer, default to 1 if not provided
//     const pageSize = parseInt(_limit);
//     const skip = (page - 1) * pageSize;

//     let oldestRecords;
//     if (filter === true) {
//       oldestRecords = await InfoQuestQuestions.find({ uuid: uuid })
//         .sort("createdAt") // Sort by createdAt field in descending order
//         .skip(skip)
//         .limit(pageSize);
//     } else {
//       oldestRecords = await InfoQuestQuestions.find()
//         .sort("createdAt") // Sort by createdAt field in descending order
//         .skip(skip)
//         .limit(pageSize);
//     }

//     const result = await getQuestionsWithStatus(oldestRecords, uuid);

//     res.status(200).json(result);
//   } catch (error) {
//     console.error("Error fetching oldest records:", error);
//     res.status(500).json({ error: "Database error" });
//   }
// });

// Get all questions last updated
// route.post("/getAllQuestsWithTheLastUpdatedOnes", async (req, res) => {
//   try {
//     let updatedRecords;
//     const latestQuestions = [];
//     if (req.body.filter === true) {
//       updatedRecords = await InfoQuestQuestions.find({ uuid: req.body.uuid });
//     } else {
//       updatedRecords = await InfoQuestQuestions.find();
//     }
//     for (const question of updatedRecords) {
//       const latestStartQuest = await StartQuests.findOne({
//         questForeignKey: question._id,
//       });

//       if (latestStartQuest) {
//         question.updatedAt = latestStartQuest.updatedAt;
//       }

//       latestQuestions.push(question);
//       console.log(question.updatedAt);
//     }
//     latestQuestions.sort((a, b) => {
//       return b.updatedAt - a.updatedAt;
//     });

//     const result = await getQuestionsWithStatus(latestQuestions, req.body.uuid);

//     const start = req.body.start;
//     const end = req.body.end;
//     console.log("Start" + start + "end" + end);
//     res.status(200).json({
//       data: result.slice(start, end),
//       message: result.length,
//       // You can include other properties here if needed
//     });
//   } catch (error) {
//     console.error("Error fetching recently updated records:", error);
//     res.status(500).json({ error: "Database error" });
//   }
// });
// route.post("/getAllYesNoQuestions", async (req, res) => {
//   try {
//     const { uuid, _page, _limit, filter } = req.body;
//     const page = parseInt(_page) || 1; // Convert query param to integer, default to 1 if not provided
//     const pageSize = parseInt(_limit);
//     const skip = (page - 1) * pageSize;
//     let Records;
//     if (filter === true) {
//       Records = await InfoQuestQuestions.find({
//         uuid: uuid,
//         whichTypeQuestion: "yes/no"
//       })
//         .sort({ createdAt: -1 }) // Sort by createdAt field in descending order
//         .skip(skip)
//         .limit(pageSize);
//     } else {
//       Records = await InfoQuestQuestions.find({ whichTypeQuestion: "yes/no" })
//         .sort({ createdAt: -1 }) // Sort by createdAt field in descending order
//         .skip(skip)
//         .limit(pageSize);
//     }
//     const result = await getQuestionsWithStatus(Records, uuid);

//     res.status(200).json(result);

//   } catch (error) {
//     console.error("Error fetching oldest records:", error);
//     res.status(500).json({ error: "Database error" });
//   }

// })

// route.post("/getAllAgreeDisagreeQuestions", async (req, res) => {
//   try {
//     const { uuid, _page, _limit, filter } = req.body;
//     const page = parseInt(_page) || 1; // Convert query param to integer, default to 1 if not provided
//     const pageSize = parseInt(_limit);
//     const skip = (page - 1) * pageSize;
//     let Records;
//     if (filter === true) {
//       Records = await InfoQuestQuestions.find({
//         uuid: uuid,
//         whichTypeQuestion: "agree/disagree"
//       })
//         .sort({ createdAt: -1 }) // Sort by createdAt field in descending order
//         .skip(skip)
//         .limit(pageSize);
//     } else {
//       Records = await InfoQuestQuestions.find({ whichTypeQuestion: "agree/disagree" })
//         .sort({ createdAt: -1 }) // Sort by createdAt field in descending order
//         .skip(skip)
//         .limit(pageSize);
//     }
//     const result = await getQuestionsWithStatus(Records, uuid);

//     res.status(200).json(result);

//   } catch (error) {
//     console.error("Error fetching oldest records:", error);
//     res.status(500).json({ error: "Database error" });
//   }

// })

// route.post("/getAllMultipleChoiceQuestions", async (req, res) => {
//   try {
//     const { uuid, _page, _limit, filter } = req.body;
//     const page = parseInt(_page) || 1; // Convert query param to integer, default to 1 if not provided
//     const pageSize = parseInt(_limit);
//     const skip = (page - 1) * pageSize;
//     let Records;
//     if (filter === true) {
//       Records = await InfoQuestQuestions.find({
//         uuid: uuid,
//         whichTypeQuestion: "multiple choise"
//       })
//         .sort({ createdAt: -1 }) // Sort by createdAt field in descending order
//         .skip(skip)
//         .limit(pageSize);
//     } else {
//       Records = await InfoQuestQuestions.find({ whichTypeQuestion: "multiple choise" })
//         .sort({ createdAt: -1 }) // Sort by createdAt field in descending order
//         .skip(skip)
//         .limit(pageSize);
//     }
//     const result = await getQuestionsWithStatus(Records, uuid);

//     res.status(200).json(result);

//   } catch (error) {
//     console.error("Error fetching oldest records:", error);
//     res.status(500).json({ error: "Database error" });
//   }

// })
// route.post("/getAllRankedChoiceQuestions", async (req, res) => {
//   try {
//     const { uuid, _page, _limit, filter } = req.body;
//     const page = parseInt(_page) || 1; // Convert query param to integer, default to 1 if not provided
//     const pageSize = parseInt(_limit);
//     const skip = (page - 1) * pageSize;
//     let Records;
//     if (filter === true) {
//       Records = await InfoQuestQuestions.find({
//         uuid: uuid,
//         whichTypeQuestion: "ranked choise"
//       })
//         .sort({ createdAt: -1 }) // Sort by createdAt field in descending order
//         .skip(skip)
//         .limit(pageSize);
//     } else {
//       Records = await InfoQuestQuestions.find({ whichTypeQuestion: "ranked choise" })
//         .sort({ createdAt: -1 }) // Sort by createdAt field in descending order
//         .skip(skip)
//         .limit(pageSize);
//     }
//     const result = await getQuestionsWithStatus(Records, uuid);

//     res.status(200).json(result);

//   } catch (error) {
//     console.error("Error fetching oldest records:", error);
//     res.status(500).json({ error: "Database error" });
//   }

// })

