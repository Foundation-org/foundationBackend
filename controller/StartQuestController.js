const InfoQuestQuestions = require("../models/InfoQuestQuestions");
const StartQuests = require("../models/StartQuests");
const User = require("../models/UserModel");
const { createLedger } = require("../utils/createLedger");
const crypto = require("crypto");
const { getTreasury, updateTreasury } = require("../utils/treasuryService");
const {
  QUEST_COMPLETED_AMOUNT,
  QUEST_COMPLETED_CHANGE_AMOUNT,
  QUEST_OPTION_ADDED_AMOUNT,
  QUEST_OPTION_CONTENTION_GIVEN_AMOUNT,
} = require("../constants");
const { getUserBalance, updateUserBalance } = require("../utils/userServices");

const updateViolationCounter = async (req, res) => {
  try {
    const result = await User.updateOne(
      { uuid: req.cookies.uuid },
      { $inc: { violationCounter: 1 } }
    );
    if (result.nModified === 0) {
      return res.status(404).send("User not found");
    }
    return res.status(200).send(result);
  } catch (error) {
    return res.status(500).send(error);
  }
};
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
    if (contendedArray.length) {
      const userBalance = await getUserBalance(req.body.uuid);
      if (userBalance < QUEST_OPTION_CONTENTION_GIVEN_AMOUNT)
        throw new Error("The balance is insufficient to give the contention!");
      // Create Ledger
      await createLedger({
        uuid: req.body.uuid,
        txUserAction: "questOptionContentionGiven",
        txID: crypto.randomBytes(11).toString("hex"),
        txAuth: "User",
        txFrom: req.body.uuid,
        txTo: "dao",
        txAmount: "0",
        txData: req.body.uuid,
        // txDescription : "User gives contention to a quest answer"
      });
      // Create Ledger
      await createLedger({
        uuid: req.body.uuid,
        txUserAction: "questOptionContentionGiven",
        txID: crypto.randomBytes(11).toString("hex"),
        txAuth: "DAO",
        txFrom: req.body.uuid,
        txTo: "DAO Treasury",
        txAmount: QUEST_OPTION_CONTENTION_GIVEN_AMOUNT,
        // txData : req.body.uuid,
        // txDescription : "DisInsentive for giving contention"
      });
      // Increment the Treasury
      await updateTreasury({
        amount: QUEST_OPTION_CONTENTION_GIVEN_AMOUNT,
        inc: true,
      });
      // Decrement the UserBalance
      await updateUserBalance({
        uuid: req.body.uuid,
        amount: QUEST_OPTION_CONTENTION_GIVEN_AMOUNT,
        dec: true,
      });
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
              uuid: req.body.addedAnswerUuid,
            },
          },
        }
      );

      // Create Ledger
      await createLedger({
        uuid: req.body.uuid,
        txUserAction: "questOptionAdded",
        txID: crypto.randomBytes(11).toString("hex"),
        txAuth: "User",
        txFrom: req.body.questForeignKey,
        txTo: "dao",
        txAmount: "0",
        txData: question._id,
        // txDescription : "User adds an answer to a quest"
      });
      // Create Ledger
      await createLedger({
        uuid: req.body.uuid,
        txUserAction: "questOptionAdded",
        txID: crypto.randomBytes(11).toString("hex"),
        txAuth: "DAO",
        txFrom: "DAO Treasury",
        txTo: req.body.uuid,
        txAmount: QUEST_OPTION_ADDED_AMOUNT,
        // txData : question._id,
        // txDescription : "Incentive for adding answer to quest"
      });
      // Decrement the Treasury
      await updateTreasury({ amount: QUEST_OPTION_ADDED_AMOUNT, dec: true });
      // Increment the UserBalance
      await updateUserBalance({
        uuid: req.body.uuid,
        amount: QUEST_OPTION_ADDED_AMOUNT,
        inc: true,
      });
    }
    // Correct Answer or Wrong Answer
    const questionCorrectAnswer = data.QuestionCorrect.toLowerCase().trim();
    if (
      questionCorrectAnswer !== "no option" &&
      questionCorrectAnswer !== "not selected"
    ) {
      // For only multiple choice question
      if (questionCorrectAnswer === "selected") {
        const questionCorrectAnswerArray = data.QuestAnswersSelected.map(
          (item) => item?.answers.toLowerCase().trim()
        );
        const givenAnswersArray = req.body.data?.selected;
        const answersMatched = givenAnswersArray.every((item) =>
          questionCorrectAnswerArray.includes(
            item?.question.toLowerCase().trim()
          )
        );
        if (answersMatched) {
          await User.findOneAndUpdate(
            { uuid: req.body.uuid },
            { $inc: { correctedAnswers: 1 } }
          );
        } else {
          await User.findOneAndUpdate(
            { uuid: req.body.uuid },
            { $inc: { wrongedAnswers: 1 } }
          );
        }
      } else {
        // for Yes/No and Agree/Disagree
        const givenAnswer = req.body.data?.selected?.toLowerCase().trim();
        if (questionCorrectAnswer === givenAnswer) {
          await User.findOneAndUpdate(
            { uuid: req.body.uuid },
            { $inc: { correctedAnswers: 1 } }
          );
        } else {
          await User.findOneAndUpdate(
            { uuid: req.body.uuid },
            { $inc: { wrongedAnswers: 1 } }
          );
        }
      }
    }
    // Check if QuestionCorrect is not "Not Selected" and push the ID to completedQuests
    // if (data.QuestionCorrect !== "Not Selected") {
    await User.findOneAndUpdate(
      { uuid: req.body.uuid },
      { $addToSet: { completedQuests: data._id } }
    );
    // Create Ledger
    await createLedger({
      uuid: req.body.uuid,
      txUserAction: "questCompleted",
      txID: crypto.randomBytes(11).toString("hex"),
      txAuth: "User",
      txFrom: req.body.uuid,
      txTo: "dao",
      txAmount: "0",
      txData: question._id,
      // txDescription : "User completes a quest"
    });
    // Create Ledger
    await createLedger({
      uuid: req.body.uuid,
      txUserAction: "questCompleted",
      txID: crypto.randomBytes(11).toString("hex"),
      txAuth: "DAO",
      txFrom: "DAO Treasury",
      txTo: req.body.uuid,
      txAmount: QUEST_COMPLETED_AMOUNT,
      // txData : question._id,
      // txDescription : "Incentive for completing quests"
    });
    // Decrement the Treasury
    await updateTreasury({ amount: QUEST_COMPLETED_AMOUNT, dec: true });
    // Increment the UserBalance
    await updateUserBalance({
      uuid: req.body.uuid,
      amount: QUEST_COMPLETED_AMOUNT,
      inc: true,
    });

    res
      .status(200)
      .json({
        message: "Start Quest Created Successfully",
        startQuestID: question._id,
      });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({
        message: `An error occurred while createStartQuest: ${err.message}`,
      });
  }
};
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
    if (startQuestQuestion?.data.length > 1) {
      let lstTimeSelectionsAndContentions =
        startQuestQuestion?.data[startQuestQuestion?.data.length - 1];

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
    if (contendedArray.length) {
      const userBalance = await getUserBalance(req.body.uuid);
      if (userBalance < QUEST_OPTION_CONTENTION_GIVEN_AMOUNT)
        throw new Error("The balance is insufficient to give the contention!");
      // Create Ledger
      await createLedger({
        uuid: req.body.uuid,
        txUserAction: "questOptionContentionGiven",
        txID: crypto.randomBytes(11).toString("hex"),
        txAuth: "User",
        txFrom: req.body.uuid,
        txTo: "dao",
        txAmount: "0",
        txData: req.body.uuid,
        // txDescription : "User gives contention to a quest answer"
      });
      // Create Ledger
      await createLedger({
        uuid: req.body.uuid,
        txUserAction: "questOptionContentionGiven",
        txID: crypto.randomBytes(11).toString("hex"),
        txAuth: "DAO",
        txFrom: req.body.uuid,
        txTo: "DAO Treasury",
        txAmount: QUEST_OPTION_CONTENTION_GIVEN_AMOUNT,
        // txData : req.body.uuid,
        // txDescription : "DisInsentive for giving contention"
      });
      // increment the Treasury
      await updateTreasury({
        amount: QUEST_OPTION_CONTENTION_GIVEN_AMOUNT,
        inc: true,
      });
      // Decrement the User Balance
      await updateUserBalance({
        amount: QUEST_OPTION_CONTENTION_GIVEN_AMOUNT,
        dec: true,
      });
    }

    await User.findOneAndUpdate(
      { uuid: req.body.uuid },
      { $inc: { contentionsGiven: contentionsGivenIncrement } }
    );

    let startQuestAnswersSelected = startQuestQuestion?.data;
    let responseMsg = "";

    let timeWhenUserUpdated = new Date(
      startQuestQuestion?.data[startQuestQuestion?.data.length - 1].created
    );

    let date1 = new Date();
    let date2 = date1.getTime();

    let dateFinal = date2 - timeWhenUserUpdated.getTime();

    if (dateFinal > 2) {
      if (
        Compare(
          startQuestQuestion?.data[startQuestQuestion?.data?.length - 1],
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

        const commonTxId = crypto.randomBytes(11).toString("hex");
        // Create Ledger
        await createLedger({
          uuid: req.body.uuid,
          txUserAction: "questCompletedChange",
          txID: commonTxId,
          txAuth: "User",
          txFrom: req.body.uuid,
          txTo: "dao",
          txAmount: "0",
          txData: startQuestQuestion._id,
          // txDescription : "User changes their answer on a quest"
        });
        // Create Ledger
        await createLedger({
          uuid: req.body.uuid,
          txUserAction: "questCompletedChange",
          txID: commonTxId,
          txAuth: "DAO",
          txFrom: "DAO Treasury",
          txTo: req.body.uuid,
          txAmount: QUEST_COMPLETED_CHANGE_AMOUNT,
          // txData : startQuestQuestion._id,
          // txDescription : "Incentive for changing a quest answer"
        });
        // Decrement the Treasury
        await updateTreasury({
          amount: QUEST_COMPLETED_CHANGE_AMOUNT,
          dec: true,
        });
        // Increment the UserBalance
        await updateUserBalance({
          uuid: req.body.uuid,
          amount: QUEST_COMPLETED_CHANGE_AMOUNT,
          inc: true,
        });
      } else {
        responseMsg = "Answer has not changed";
      }
    } else {
      responseMsg = "You can change your answer once every 1 hour";
    }

    res
      .status(200)
      .json({ message: responseMsg, startQuestID: startQuestQuestion._id });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({
        message: `An error occurred while updateChangeAnsStartQuest: ${err.message}`,
      });
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
};
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
};
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
          res.data[res.data.length - 1].selected === "Agree" ||
          res.data[res.data.length - 1].selected === "Like"
        ) {
          startQuestWithPositiveAns += 1;
          if (
            res.data[res.data.length - 1].contended === "Yes" ||
            res.data[res.data.length - 1].contended === "Agree" ||
            res.data[res.data.length - 1].contended === "Like"
          ) {
            startQuestWithPositiveConAns += 1;
          } else if (
            res.data[res.data.length - 1].contended === "No" ||
            res.data[res.data.length - 1].contended === "Disagree" ||
            res.data[res.data.length - 1].contended === "Unlike"
          ) {
            startQuestWithNagativeConAns += 1;
          }
        } else if (
          res.data[res.data.length - 1].selected === "No" ||
          res.data[res.data.length - 1].selected === "Disagree" ||
          res.data[res.data.length - 1].selected === "Unlike"
        ) {
          startQuestWithNagativeAns += 1;
          if (
            res.data[res.data.length - 1].contended === "No" ||
            res.data[res.data.length - 1].contended === "Disagree" ||
            res.data[res.data.length - 1].contended === "Unlike"
          ) {
            startQuestWithNagativeConAns += 1;
          } else if (
            res.data[res.data.length - 1].contended === "Yes" ||
            res.data[res.data.length - 1].contended === "Agree" ||
            res.data[res.data.length - 1].contended === "Unlike"
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
            Yes: isNaN(percentageOfYesAns)
              ? 0
              : percentageOfYesAns % 1 === 0
              ? percentageOfYesAns
              : parseFloat(percentageOfYesAns.toFixed(1)),
            No: isNaN(percentageOfNoAns)
              ? 0
              : percentageOfNoAns % 1 === 0
              ? percentageOfNoAns
              : parseFloat(percentageOfNoAns.toFixed(1)),
          },
          contendedPercentage: {
            Yes: isNaN(percentageOfYesConAns)
              ? 0
              : percentageOfYesConAns % 1 === 0
              ? percentageOfYesConAns
              : parseFloat(percentageOfYesConAns.toFixed(1)),
            No: isNaN(percentageOfNoConAns)
              ? 0
              : percentageOfNoConAns % 1 === 0
              ? percentageOfNoConAns
              : parseFloat(percentageOfNoConAns.toFixed(1)),
          },
        };

        console.log(responseObj);
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
            : percentage % 1 === 0
            ? percentage
            : parseFloat(percentage.toFixed(1));
        }

        for (const option in contendedOptionsCount) {
          const percentage = (contendedOptionsCount[option] / responses) * 100;

          percentageOfContendedOptions[option] = isNaN(percentage)
            ? 0
            : percentage % 1 === 0
            ? percentage
            : parseFloat(percentage.toFixed(1));
        }

        const responseObj = {
          selectedPercentage: percentageOfSelectedOptions,
          contendedPercentage: percentageOfContendedOptions,
        };
        console.log(responseObj);
        res.status(200).json([responseObj]);
      }
    });
  } catch (err) {
    res.status(500).send("Not Created 2");
  }
};
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
};

module.exports = {
  updateViolationCounter,
  createStartQuest,
  updateChangeAnsStartQuest,
  getRankedQuestPercent,
  getStartQuestPercent,
  getStartQuestInfo,
};
