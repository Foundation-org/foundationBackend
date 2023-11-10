const express = require("express");
const router = express.Router();
// controller
const StartQuestController = require("../controller/StartQuestController");
// middleware
const protect = require("../middleware/protect");

router.post("/updateViolationCounter", StartQuestController.updateViolationCounter)
router.post("/createStartQuest", StartQuestController.createStartQuest)
router.post("/updateChangeAnsStartQuest", StartQuestController.updateChangeAnsStartQuest)
router.post("/getRankedQuestPercent", StartQuestController.getRankedQuestPercent)
router.post("/getStartQuestPercent", StartQuestController.getStartQuestPercent)
router.post("/getStartQuestInfo", StartQuestController.getStartQuestInfo)

module.exports = router;


// route.post("/updateChangeAnsStartQuest", async (req, res) => {
//   try {
//     const startQuestQuestion = await StartQuests.findOne({
//       questForeignKey: req.body.questId,
//       uuid: req.body.uuid,
//     });

//     // Get the current date and time
//     const currentDate = new Date();

//     InfoQuestQuestions.findByIdAndUpdate(
//       { _id: req.body.questId },
//       {
//         $set: { lastInteractedAt: currentDate.toISOString() },
//         $inc: { interactingCounter: 1 },
//       }
//     ).exec(),
//       (err, data) => {
//         if (err) {
//           return res.status(500).send(err);
//         } else {
//           return res.status(200).send(data);
//         }
//       };

//     // Check req.body.data and the last element's contended and selected arrays objects
//     const lastDataElement = req.body.changeAnswerAddedObj;

//     // Function to process an array
//     const processArray = async (array, fieldToUpdate) => {
//       if (array && Array.isArray(array)) {
//         for (const item of array) {
//           // Check if item.question matches addedAnswer in StartQuests
//           const matchingStartQuest = await StartQuests.findOne({
//             addedAnswer: item.question,
//           });

//           if (matchingStartQuest) {
//             // Get the uuid of the matching record
//             const matchingUuid = matchingStartQuest.uuid;

//             // Define the field to update based on the provided fieldToUpdate parameter
//             const updateField = {};
//             updateField[fieldToUpdate] = 1;

//             // Increment the specified field in the User table
//             await User.findOneAndUpdate(
//               { uuid: matchingUuid },
//               { $inc: updateField }
//             );
//           }
//         }
//       }
//     };

//     // Process both 'contended' and 'selected' arrays
//     await Promise.all([
//       processArray(lastDataElement.contended, "contentionsOnAddedAns"),
//       processArray(lastDataElement.selected, "selectionsOnAddedAns"),
//     ]);

//     let startQuestAnswersSelected = startQuestQuestion.data;
//     console.log(
//       "startQuestQuestion.data",
//       startQuestQuestion.data[startQuestQuestion.data.length - 1]
//     );
//     console.log(
//       "req.body.changeAnswerAddedObj ",
//       req.body.changeAnswerAddedObj
//     );
//     let responseMsg = "";

//     let timeWhenUserUpdated = new Date(
//       startQuestQuestion.data[startQuestQuestion.data.length - 1].created
//     );

//     let date1 = new Date();
//     let date2 = date1.getTime();

//     let dateFinal = date2 - timeWhenUserUpdated.getTime();

//     console.log("dateFinal", dateFinal);

//     // if (dateFinal > 3600000) {
//     if (dateFinal > 2) {
//       if (
//         Compare(
//           startQuestQuestion.data[startQuestQuestion.data.length - 1],
//           req.body.changeAnswerAddedObj
//         )
//       ) {
//         //Comparing old and new answer

//         let AnswerAddedOrNot = startQuestQuestion.addedAnswerByUser;

//         if (typeof req.body.changeAnswerAddedObj.selected !== "string") {
//           req.body.changeAnswerAddedObj.selected.map((option) => {
//             if (option.addedAnswerByUser === true) {
//               AnswerAddedOrNot = option.question;
//               const addAnswer = {
//                 question: option.question,
//                 // someOneAdded: true,
//                 selected: true,
//               };
//               InfoQuestQuestions.findByIdAndUpdate(
//                 { _id: req.body.questId },
//                 { $push: { QuestAnswers: addAnswer } }
//               ).exec(),
//                 (err, data) => {
//                   if (err) {
//                     return res.status(500).send(err);
//                   } else {
//                     return res.status(200).send(data);
//                   }
//                 };
//             }
//           });
//         }

//         responseMsg = "Updated";
//         // console.log(startQuestAnswersSelected);
//         startQuestAnswersSelected.push(req.body.changeAnswerAddedObj);
//         // console.log(startQuestAnswersSelected);

//         await StartQuests.findByIdAndUpdate(
//           { _id: startQuestQuestion._id },
//           { data: startQuestAnswersSelected, addedAnswer: AnswerAddedOrNot },
//           { upsert: true }
//         ).exec(),
//           (err, data) => {
//             if (err) {
//               return res.status(500).send(err);
//             } else {
//               return res.status(200).send(data);
//             }
//           };
//       } else {
//         responseMsg = "Answer has not changed";
//       }
//     } else {
//       console.log("You can change your answer once every 1 hour");
//       responseMsg = "You can change your answer once every 1 hour";
//     }

//     res.status(200).json(responseMsg);
//   } catch (err) {
//     res.status(500).send("Not Created 2");
//   }

//   function Compare(obj1, obj2) {
//     // Clone the objects to prevent modifying the original objects
//     const clonedObj1 = { ...obj1 };
//     const clonedObj2 = { ...obj2 };

//     // Remove the 'created' property from the cloned objects as it can be different
//     delete clonedObj1.created;
//     delete clonedObj2.created;

//     // Convert the modified objects to JSON strings and compare them
//     const stringifiedObj1 = JSON.stringify(clonedObj1);
//     const stringifiedObj2 = JSON.stringify(clonedObj2);

//     // Compare the JSON strings
//     if (stringifiedObj1 === stringifiedObj2) {
//       return false; // Objects match
//     } else {
//       return true; // Objects do not match
//     }
//   }
// });



// route.post("/updateChangeAnsStartQuest", async (req, res) => {
//   try {
//     const startQuestQuestion = await StartQuests.findOne({
//       questForeignKey: req.body.questId,
//       uuid: req.body.uuid,
//     });

//     let startQuestAnswersSelected = startQuestQuestion.data;
//     console.log("startQuestQuestion.data", startQuestQuestion.data);
//     let responseMsg = "";

//     let timeWhenUserUpdated = new Date(
//       startQuestQuestion.data[startQuestQuestion.data.length - 1].created
//     );

//     let date1 = new Date();
//     let date2 = date1.getTime();

//     let dateFinal = date2 - timeWhenUserUpdated.getTime();

//     console.log("dateFinal", dateFinal);

//     if (dateFinal > 3600000) {
//       let AnswerAddedOrNot = startQuestQuestion.addedAnswerByUser;

//       console.log(req.body.changeAnswerAddedObj.selected);
//       console.log(startQuestAnswersSelected);
//       console.log(JSON.stringify(startQuestAnswersSelected));

//       // Check if the new answer is different from the existing answer
//       if (
//         typeof req.body.changeAnswerAddedObj.selected !== "string" &&
//         JSON.stringify(
//           req.body.changeAnswerAddedObj.selected.toLowerCase().trim()
//         ) !== JSON.stringify(startQuestAnswersSelected.toLowerCase().trim())
//       ) {
//         if (typeof req.body.changeAnswerAddedObj.selected !== "string") {
//           req.body.changeAnswerAddedObj.selected.map((option) => {
//             if (option.addedAnswerByUser === true) {
//               AnswerAddedOrNot = option.question;
//               const addAnswer = {
//                 question: option.question,
//                 selected: true,
//               };
//               InfoQuestQuestions.findByIdAndUpdate(
//                 { _id: req.body.questId },
//                 { $push: { QuestAnswers: addAnswer } }
//               ).exec(),
//                 (err, data) => {
//                   if (err) {
//                     return res.status(500).send(err);
//                   } else {
//                     return res.status(200).send(data);
//                   }
//                 };
//             }
//           });
//         }

//         responseMsg = "Updated";
//         startQuestAnswersSelected.push(req.body.changeAnswerAddedObj);

//         await StartQuests.findByIdAndUpdate(
//           { _id: startQuestQuestion._id },
//           { data: startQuestAnswersSelected, addedAnswer: AnswerAddedOrNot },
//           { upsert: true }
//         ).exec(),
//           (err, data) => {
//             if (err) {
//               return res.status(500).send(err);
//             } else {
//               return res.status(200).send(data);
//             }
//           };
//       } else {
//         // Answer has not changed
//         console.log("Answer has not changed");
//         responseMsg = "Answer has not changed";
//       }
//     } else {
//       console.log("You can change your answer once every 1 hour");
//       responseMsg = "You can change your answer once every 1 hour";
//     }

//     res.status(200).json(responseMsg);
//   } catch (err) {
//     res.status(500).send("Not Created 2");
//   }
// });
