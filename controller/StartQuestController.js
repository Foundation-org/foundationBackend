const InfoQuestQuestions = require("../models/InfoQuestQuestions");
const StartQuests = require("../models/StartQuests");
const User = require("../models/UserModel");
const { createLedger } = require("../utils/createLedger");
const crypto = require("crypto");

const updateViolationCounter = async (req, res) => {
    try {
      const result = await User.updateOne(
        { uuid: req.body.uuid },
        { $inc: { violationCounter: 1 } }
      );
      if (result.nModified === 0) {
        return res.status(404).send("User not found");
      }
      return res.status(200).send(result);
    } catch (error) {
      return res.status(500).send(error);
    }
  }
const createStartQuest = async (req, res) => {
    try {
      const currentDate = new Date();
  
      // Update InfoQuestQuestions and get the data
      const data = await InfoQuestQuestions.findByIdAndUpdate(
        { _id: req.body.questForeignKey },
        {
          $set: { lastInteractedAt: currentDate.toISOString() },
          $inc: { interactingCounter: 1 },
        },
        { new: true } // To get the updated document
      );
  
      if (!data) {
        return res.status(404).send("InfoQuestQuestions not found");
      }
  
      // Get the UUID of the matching record in InfoQuestQuestions
      const matchingUuid = data.uuid;
  
      // Update the User table with the matching UUID and increment 'userAnswered'
      await User.findOneAndUpdate(
        { uuid: matchingUuid },
        { $inc: { usersAnswered: 1 } }
      );
  
      // Process the 'contended' array and increment 'contentionsGiven'
      const contendedArray = req.body.data?.contended || [];
      const contentionsGivenIncrement = contendedArray.length;
      // if user gives contention
      if(contendedArray.length) {
        // Create Ledger
        await createLedger(
          {
            uuid : req.body.uuid,
            txUserAction : "questOptionContentionGiven",
            txID : crypto.randomBytes(11).toString("hex"),
            txAuth : "User",
            txFrom : req.body.uuid,
            txTo : "dao",
            txAmount : "0",
            txData : req.body.uuid,
            // txDescription : "User gives contention to a quest answer"
          }
        )
      }
  
      await User.findOneAndUpdate(
        { uuid: req.body.uuid },
        { $inc: { contentionsGiven: contentionsGivenIncrement } }
      );
  
      // Function to process an array
      const processArray = async (array, fieldToUpdate) => {
        if (array && Array.isArray(array)) {
          for (const item of array) {
            // Check if item.question matches addedAnswer in StartQuests
            const matchingStartQuest = await StartQuests.findOne({
              addedAnswer: item.question,
            });
  
            if (matchingStartQuest) {
              // Get the uuid of the matching record
              const matchingUuid = matchingStartQuest.uuid;
  
              // Define the field to update based on the provided fieldToUpdate parameter
              const updateField = {};
              updateField[fieldToUpdate] = 1;
  
              // Increment the specified field in the User table
              await User.findOneAndUpdate(
                { uuid: matchingUuid },
                { $inc: updateField }
              );
            }
          }
        }
      };
  
      // Process the 'selected' array
      await processArray(req.body.data?.selected, "selectionsOnAddedAns");
  
      // Create a new StartQuests document
      const question = new StartQuests({
        questForeignKey: req.body.questForeignKey,
        uuid: req.body.uuid,
        addedAnswer: req.body.addedAnswer,
        data: req.body.data,
      });
  
      await question.save();
  
      if (req.body.addedAnswer !== "") {
        // Increment 'addedAnswers' for the user
        await User.findOneAndUpdate(
          { uuid: req.body.uuid },
          { $inc: { addedAnswers: 1 } }
        );
  
        // Push the added answer to InfoQuestQuestions
        await InfoQuestQuestions.findByIdAndUpdate(
          { _id: req.body.questForeignKey },
          {
            $push: {
              QuestAnswers: {
                question: req.body.addedAnswer,
                selected: true,
              },
            },
          }
        );
  
        // Create Ledger
      await createLedger(
        {
          uuid : req.body.uuid,
          txUserAction : "questOptionAdded",
          txID : crypto.randomBytes(11).toString("hex"),
          txAuth : "User",
          txFrom : req.body.questForeignKey,
          txTo : "dao",
          txAmount : "0",
          txData : question._id,
          // txDescription : "User adds an answer to a quest"
        })
  
      }
  
      // Check if QuestionCorrect is not "Not Selected" and push the ID to completedQuests
      // if (data.QuestionCorrect !== "Not Selected") {
      await User.findOneAndUpdate(
        { uuid: req.body.uuid },
        { $addToSet: { completedQuests: data._id } }
      );
      // Create Ledger
      await createLedger(
        {
          uuid : req.body.uuid,
          txUserAction : "questCompleted",
          txID : crypto.randomBytes(11).toString("hex"),
          txAuth : "User",
          txFrom : req.body.uuid,
          txTo : "dao",
          txAmount : "0",
          txData : question._id,
          // txDescription : "User completes a quest"
        })
      // }
  
      res.status(200).json({ message: "Start Quest Created Successfully", startQuestID: question._id  });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: `An error occurred while createStartQuest: ${err.message}` });

    }
  }
const updateChangeAnsStartQuest = async (req, res) => {
    try {
      const startQuestQuestion = await StartQuests.findOne({
        questForeignKey: req.body.questId,
        uuid: req.body.uuid,
      });
  
      // Get the current date and time
      const currentDate = new Date();
  
      InfoQuestQuestions.findByIdAndUpdate(
        { _id: req.body.questId },
        {
          $set: { lastInteractedAt: currentDate.toISOString() },
          $inc: { interactingCounter: 1 },
        }
      ).exec();
  
      User.findOneAndUpdate(
        { uuid: req.body.uuid },
        { $inc: { changedAnswers: 1 } }
      ).exec();
  
      // Check req.body.data and the last element's contended and selected arrays objects
      const lastDataElement = req.body.changeAnswerAddedObj;
  
      // INCREMENT
      // Function to process an array
      const incrementProcessArray = async (array, fieldToUpdate) => {
        if (array && Array.isArray(array)) {
          for (const item of array) {
            // Check if item.question matches addedAnswer in StartQuests
            const matchingStartQuest = await StartQuests.findOne({
              addedAnswer: item.question,
            });
  
            if (matchingStartQuest) {
              // Get the uuid of the matching record
              const matchingUuid = matchingStartQuest.uuid;
  
              // Define the field to update based on the provided fieldToUpdate parameter
              const updateField = {};
              updateField[fieldToUpdate] = 1;
  
              // Increment the specified field in the User table
              await User.findOneAndUpdate(
                { uuid: matchingUuid },
                { $inc: updateField }
              );
            }
          }
        }
      };
  
      // Process both 'contended' and 'selected' arrays for increment
      await Promise.all([
        incrementProcessArray(lastDataElement.contended, "contentionsOnAddedAns"),
        incrementProcessArray(lastDataElement.selected, "selectionsOnAddedAns"),
      ]);
  
      // DECREMENT
      // Function to process an array
      const decrementProcessArray = async (array, field, fieldToUpdate) => {
        if (array && Array.isArray(array)) {
          for (const item of array) {
            const isMatch = lastDataElement[field].some(
              (contendedItem) => contendedItem.question === item.question
            );
            if (!isMatch) {
              // Check if item.question matches addedAnswer in StartQuests
              const matchingStartQuest = await StartQuests.findOne({
                addedAnswer: item.question,
              });
              if (matchingStartQuest) {
                // Get the uuid of the matching record
                const matchingUuid = matchingStartQuest.uuid;
  
                // Define the field to update based on the provided fieldToUpdate parameter
                const updateField = {};
                updateField[fieldToUpdate] = -1;
  
                // Increment the specified field in the User table
                await User.findOneAndUpdate(
                  { uuid: matchingUuid },
                  { $inc: updateField }
                );
              }
            }
          }
        }
      };
  
      // DECREMENT
      if (startQuestQuestion.data.length > 1) {
        let lstTimeSelectionsAndContentions =
          startQuestQuestion.data[startQuestQuestion.data.length - 1];
  
        // Process both 'contended' and 'selected' arrays for decrement
        await Promise.all([
          decrementProcessArray(
            lstTimeSelectionsAndContentions.contended,
            "contended",
            "contentionsOnAddedAns"
          ),
          decrementProcessArray(
            lstTimeSelectionsAndContentions.selected,
            "selected",
            "selectionsOnAddedAns"
          ),
        ]);
      }
  
      // Increment 'contentionsGiven' based on the length of 'contended' array
      const contendedArray = req.body.changeAnswerAddedObj?.contended || [];
      const contentionsGivenIncrement = contendedArray.length;
      if(contendedArray.length) {
        // Create Ledger
        await createLedger(
          {
            uuid : req.body.uuid,
            txUserAction : "questOptionContentionGiven",
            txID : crypto.randomBytes(11).toString("hex"),
            txAuth : "User",
            txFrom : req.body.uuid,
            txTo : "dao",
            txAmount : "0",
            txData : req.body.uuid,
            // txDescription : "User gives contention to a quest answer"
          }
        )
      }
  
      await User.findOneAndUpdate(
        { uuid: req.body.uuid },
        { $inc: { contentionsGiven: contentionsGivenIncrement } }
      );
  
      let startQuestAnswersSelected = startQuestQuestion.data;
      let responseMsg = "";
  
      let timeWhenUserUpdated = new Date(
        startQuestQuestion.data[startQuestQuestion.data.length - 1].created
      );
  
      let date1 = new Date();
      let date2 = date1.getTime();
  
      let dateFinal = date2 - timeWhenUserUpdated.getTime();
  
      if (dateFinal > 2) {
        if (
          Compare(
            startQuestQuestion.data[startQuestQuestion.data.length - 1],
            req.body.changeAnswerAddedObj
          )
        ) {
          let AnswerAddedOrNot = startQuestQuestion.addedAnswerByUser;
  
          if (typeof req.body.changeAnswerAddedObj.selected !== "string") {
            req.body.changeAnswerAddedObj.selected.map(async (option) => {
              if (option.addedAnswerByUser === true) {
                await User.findOneAndUpdate(
                  { uuid: req.body.uuid },
                  { $inc: { addedAnswers: 1 } }
                );
                AnswerAddedOrNot = option.question;
                const addAnswer = {
                  question: option.question,
                  selected: true,
                };
                InfoQuestQuestions.findByIdAndUpdate(
                  { _id: req.body.questId },
                  { $push: { QuestAnswers: addAnswer } }
                ).exec();
              }
            });
          }
  
          responseMsg = "Start Quest Updated Successfully";
          startQuestAnswersSelected.push(req.body.changeAnswerAddedObj);
  
          await StartQuests.findByIdAndUpdate(
            { _id: startQuestQuestion._id },
            { data: startQuestAnswersSelected, addedAnswer: AnswerAddedOrNot },
            { upsert: true }
          ).exec();
  
          // Create Ledger
          await createLedger(
          {
            uuid : req.body.uuid,
            txUserAction : "questCompletedChange",
            txID : crypto.randomBytes(11).toString("hex"),
            txAuth : "User",
            txFrom : req.body.uuid,
            txTo : "dao",
            txAmount : "0",
            txData : startQuestQuestion._id,
            // txDescription : "User changes their answer on a quest"
          })
  
        } else {
          responseMsg = "Answer has not changed";
        }
      } else {
        responseMsg = "You can change your answer once every 1 hour";
      }
  
      res.status(200).json({ message: responseMsg, startQuestID: startQuestQuestion._id });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: `An error occurred while updateChangeAnsStartQuest: ${err.message}` });
    }
  
    function Compare(obj1, obj2) {
      const clonedObj1 = { ...obj1 };
      const clonedObj2 = { ...obj2 };
  
      delete clonedObj1.created;
      delete clonedObj2.created;
  
      const stringifiedObj1 = JSON.stringify(clonedObj1);
      const stringifiedObj2 = JSON.stringify(clonedObj2);
  
      if (stringifiedObj1 === stringifiedObj2) {
        return false;
      } else {
        return true;
      }
    }
  }
const getRankedQuestPercent = async (req, res) => {
    try {
      const StartQuestsData = await StartQuests.find({
        questForeignKey: req.body.questForeignKey,
      });
      const optionsCount = {};
      let totalCount = 0;
      const mapExecution = StartQuestsData.map(async (res) => {
        let i = 1;
  
        res.data[res.data.length - 1].selected?.map((option) => {
          const question = option.question.trim();
          if (optionsCount[question]) {
            optionsCount[question] +=
              res.data[res.data.length - 1].selected.length - i;
            console.log("selected option" + optionsCount[question]);
            console.log(question);
          } else {
            optionsCount[question] =
              res.data[res.data.length - 1].selected.length - i;
            console.log("selected option first" + optionsCount[question]);
            console.log(question);
          }
          totalCount += res.data[res.data.length - 1].selected.length - i;
          i++;
          console.log("Total responses :" + totalCount);
        });
      });
  
      return Promise.all(mapExecution).then(() => {
        const percentageOfOptions = {};
  
        for (const option in optionsCount) {
          const percentage = (optionsCount[option] / totalCount) * 100;
  
          percentageOfOptions[option] = isNaN(percentage)
            ? 0
            : Number(Math.round(percentage));
        }
  
        const responseObj = {
          rankedPercentage: percentageOfOptions,
        };
        res.status(200).json([responseObj]);
      });
    } catch (err) {
      res.status(500).send("Not Created 2");
    }
  }
const getStartQuestPercent = async (req, res) => {
    try {
      const StartQuestsData = await StartQuests.find({
        questForeignKey: req.body.questForeignKey,
        // questForeignKey: "64a6d5a9313105966b9682f2",
      });
      // console.log("StartQuestsData", StartQuestsData);
  
      let startQuestWithNagativeAns = 0,
        startQuestWithPositiveAns = 0; //length of total length
      let startQuestWithNagativeConAns = 0,
        startQuestWithPositiveConAns = 0;
      const selectedOptionsCount = {}; // Object to store the count of each option
      const contendedOptionsCount = {}; // Object to store the count of each option
      let totalSelectedResponses = 0;
      let totalContendedResponses = 0;
      let questype;
  
      const mapExecution = StartQuestsData.map(async (res) => {
        if (typeof res.data[res.data.length - 1].selected === "string") {
          questype = 1;
          if (
            res.data[res.data.length - 1].selected === "Yes" ||
            res.data[res.data.length - 1].selected === "Agree"
          ) {
            startQuestWithPositiveAns += 1;
            if (
              res.data[res.data.length - 1].contended === "Yes" ||
              res.data[res.data.length - 1].contended === "Agree"
            ) {
              startQuestWithPositiveConAns += 1;
            } else if (
              res.data[res.data.length - 1].contended === "No" ||
              res.data[res.data.length - 1].contended === "Disagree"
            ) {
              startQuestWithNagativeConAns += 1;
            }
          } else if (
            res.data[res.data.length - 1].selected === "No" ||
            res.data[res.data.length - 1].selected === "Disagree"
          ) {
            startQuestWithNagativeAns += 1;
            if (
              res.data[res.data.length - 1].contended === "No" ||
              res.data[res.data.length - 1].contended === "Disagree"
            ) {
              startQuestWithNagativeConAns += 1;
            } else if (
              res.data[res.data.length - 1].contended === "Yes" ||
              res.data[res.data.length - 1].contended === "Agree"
            ) {
              startQuestWithPositiveConAns += 1;
            }
          }
        } else {
          if (res.data[res.data.length - 1].selected) {
            res.data[res.data.length - 1].selected?.map((option) => {
              const question = option.question.trim();
              if (selectedOptionsCount[question]) {
                selectedOptionsCount[question]++;
                console.log("selected option" + selectedOptionsCount[question]);
                console.log(question);
              } else {
                selectedOptionsCount[question] = 1;
                console.log(
                  "selected option first" + selectedOptionsCount[question]
                );
                console.log(question);
              }
            });
            totalSelectedResponses++;
          }
          console.log("Total Selected responses :" + totalSelectedResponses);
  
          if (res.data[res.data.length - 1].contended) {
            res.data[res.data.length - 1].contended.map((option) => {
              const question = option.question.trim();
              if (contendedOptionsCount[question]) {
                contendedOptionsCount[question]++;
                console.log("contended option" + contendedOptionsCount[question]);
                console.log(question);
              } else {
                contendedOptionsCount[question] = 1;
                console.log(
                  "First contended option" + contendedOptionsCount[question]
                );
                console.log(question);
              }
            });
            totalContendedResponses++;
          }
          console.log("Total Contended responses :" + totalContendedResponses);
        }
      });
  
      // let ownCreatedIds = [];
  
      // StartQuestsData.map(function (rc) {
      //   ownCreatedIds.push(rc._id);
      // });
  
      // console.log("ownCreatedIds", ownCreatedIds);
  
      // const mapExecution = ownCreatedIds.map(async function (rc) {
      //   await StartQuests.findOne({
      //     _id: rc.toString(),
      //   }).then((res) => {
      //     console.log("res", res);
  
      //     if (typeof res.data[res.data.length - 1].selected === "string") {
      //       if (res.data[res.data.length - 1].selected === "Yes" || res.data[res.data.length - 1].selected === "Agree") {
      //         startQuestWithPositiveAns += 1;
      //       } else if (res.data[res.data.length - 1].selected === "No" || res.data[res.data.length - 1].selected === "Disagree") {
      //         startQuestWithNagativeAns += 1;
      //       }
      //     } else {
      //     console.log("res.data", res.data[0]);
      //   }
      //   });
      // });
      return Promise.all(mapExecution).then(() => {
        if (questype === 1) {
          let TotalNumberOfAns =
            startQuestWithPositiveAns + startQuestWithNagativeAns;
          console.log("TotalNumberOfAns", TotalNumberOfAns);
  
          let percentageOfYesAns =
            startQuestWithPositiveAns === 0
              ? 0
              : (startQuestWithPositiveAns * 100) / TotalNumberOfAns;
          console.log("startQuestWithPositiveAns", percentageOfYesAns);
  
          let percentageOfNoAns =
            startQuestWithNagativeAns === 0
              ? 0
              : (startQuestWithNagativeAns * 100) / TotalNumberOfAns;
          console.log("startQuestWithNagativeAns", percentageOfNoAns);
  
          let TotalNumberOfConAns =
            startQuestWithPositiveConAns + startQuestWithNagativeConAns;
          console.log("TotalNumberOfConAns", TotalNumberOfConAns);
  
          let percentageOfYesConAns =
            startQuestWithPositiveConAns === 0
              ? 0
              : (startQuestWithPositiveConAns * 100) / TotalNumberOfConAns;
          console.log("startQuestWithPositiveConAns", percentageOfYesConAns);
  
          let percentageOfNoConAns =
            startQuestWithNagativeConAns === 0
              ? 0
              : (startQuestWithNagativeConAns * 100) / TotalNumberOfConAns;
  
          const responseObj = {
            selectedPercentage: {
              Yes: percentageOfYesAns === NaN ? 0 : percentageOfYesAns,
              No: percentageOfNoAns === NaN ? 0 : percentageOfNoAns,
            },
            contendedPercentage: {
              Yes: percentageOfYesConAns === NaN ? 0 : percentageOfYesConAns,
              No: percentageOfNoConAns === NaN ? 0 : percentageOfNoConAns,
            },
          };
  
          res.status(200).json([responseObj]);
        } else {
          const percentageOfSelectedOptions = {};
          const percentageOfContendedOptions = {};
          let responses;
          if (totalSelectedResponses > totalContendedResponses) {
            responses = totalSelectedResponses;
          } else {
            responses = totalContendedResponses;
          }
          // Calculate the percentage for each option
          for (const option in selectedOptionsCount) {
            const percentage = (selectedOptionsCount[option] / responses) * 100;
  
            percentageOfSelectedOptions[option] = isNaN(percentage)
              ? 0
              : Number(Math.round(percentage));
          }
  
          for (const option in contendedOptionsCount) {
            const percentage = (contendedOptionsCount[option] / responses) * 100;
            Number(Math.round(percentage));
            percentageOfContendedOptions[option] = isNaN(percentage)
              ? 0
              : Number(Math.round(percentage));
          }
  
          const responseObj = {
            selectedPercentage: percentageOfSelectedOptions,
            contendedPercentage: percentageOfContendedOptions,
          };
          res.status(200).json([responseObj]);
        }
      });
    } catch (err) {
      res.status(500).send("Not Created 2");
    }
  }
const getStartQuestInfo = async (req, res) => {
    try {
      const startQuestQuestion = await StartQuests.findOne({
        questForeignKey: req.body.questForeignKey,
        uuid: req.body.uuid,
      });
  
      res.status(200).json(startQuestQuestion);
    } catch (err) {
      res.status(500).send("Not Created 2");
    }
  }


module.exports = {
    updateViolationCounter,
    createStartQuest,
    updateChangeAnsStartQuest,
    getRankedQuestPercent,
    getStartQuestPercent,
    getStartQuestInfo,
}