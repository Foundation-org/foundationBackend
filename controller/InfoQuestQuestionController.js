const { QUEST_CREATED_AMOUNT } = require("../constants");
const InfoQuestQuestions = require("../models/InfoQuestQuestions");
const StartQuests = require("../models/StartQuests");
const User = require("../models/UserModel");
const { createLedger } = require("../utils/createLedger");
const crypto = require("crypto");
const { getTreasury, updateTreasury } = require("../utils/treasuryService");
const { getUserBalance, updateUserBalance } = require("../utils/userServices");
const BookmarkQuests = require("../models/BookmarkQuests");
const { getPercentage } = require("../utils/getPercentage");

const createInfoQuestQuest = async (req, res) => {
  try {
    const userBalance = await getUserBalance(req.body.uuid);
    if (userBalance < QUEST_CREATED_AMOUNT)
      throw new Error("The balance is insufficient to create a Quest!");
    const question = await new InfoQuestQuestions({
      Question: req.body.Question,
      QuestionCorrect: req.body.QuestionCorrect,
      whichTypeQuestion: req.body.whichTypeQuestion,
      usersAddTheirAns: req.body.usersAddTheirAns || false,
      usersChangeTheirAns: req.body.usersChangeTheirAns,
      QuestTopic: req.body.QuestTopic,
      userCanSelectMultiple: req.body.userCanSelectMultiple,
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
    user.createdQuests?.push(createdQuestion._id);
    // await User.findOneAndUpdate(
    //   { uuid: req.body.uuid },
    //   {
    //     $push: { createdQuests: createdQuestion._id },
    //   }
    // );

    // Save the updated user object
    await user.save();

    // Create Ledger
    await createLedger({
      uuid: user.uuid,
      txUserAction: "questCreated",
      txID: crypto.randomBytes(11).toString("hex"),
      txAuth: "User",
      txFrom: user.uuid,
      txTo: "dao",
      txAmount: "0",
      txData: createdQuestion._id,
      // txDescription : "User creates a new quest"
    });
    // Create Ledger
    await createLedger({
      uuid: user.uuid,
      txUserAction: "questCreated",
      txID: crypto.randomBytes(11).toString("hex"),
      txAuth: "DAO",
      txFrom: user.uuid,
      txTo: "DAO Treasury",
      txAmount: QUEST_CREATED_AMOUNT,
      // txData : createdQuestion._id,
      // txDescription : "Incentive for creating a quest"
    });
    // Increment the Treasury
    await updateTreasury({ amount: QUEST_CREATED_AMOUNT, inc: true });
    // Decrement the UserBalance
    await updateUserBalance({
      uuid: req.body.uuid,
      amount: QUEST_CREATED_AMOUNT,
      dec: true,
    });

    res.status(201).json({
      message: "Quest has been Created",
      questID: createdQuestion._id,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      message: `An error occurred while createInfoQuestQuest: ${error.message}`,
    });
  }
};
const constraintForUniqueQuestion = async (req, res) => {
  try {
    // Get the question from the query parameters and convert it to lowercase
    const queryQuestion = req.query.question?.toLowerCase();

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
};
const getAllQuests = async (req, res) => {
  try {
    const Questions = await InfoQuestQuestions.find();
    const resultArray = Questions.map(getPercentage);
    res.status(200).json(resultArray);
  } catch (err) {
    res.status(500).send(err);
  }
};
const getAllQuestsWithOpenInfoQuestStatus = async (req, res) => {
  try {
    let allQuestions;

    let filterObj = {};
    if (req.body.filter === true) {
      if (req.body.Page === "Bookmark") {
        filterObj.createdBy = req.body.uuid;
      } else {
        filterObj.uuid = req.body.uuid;
      }
    }

    if (req.body.type) {
      filterObj.whichTypeQuestion = req.body.type;
    }
    if (req.body.terms && req.body.terms.length > 0) {
      const regexTerm = req.body.terms.map((term) => new RegExp(term, "i"));
      filterObj.QuestTopic = { $in: regexTerm };
    } else if (req.body.blockedTerms && req.body.blockedTerms.length > 0) {
      const regexBlockterms = req.body.blockedTerms.map(
        (term) => new RegExp(term, "i")
      );
      filterObj.QuestTopic = { $nin: regexBlockterms };
    }

    if (req.body.Page === "Bookmark") {
      console.log("running");
      filterObj.uuid = req.body.uuid;
      const Questions = await BookmarkQuests.find(filterObj).sort(
        req.body.sort === "Newest First" ? { createdAt: -1 } : "createdAt"
      );

      const mapPromises = Questions.map(async function (record) {
        return await InfoQuestQuestions.findOne({
          _id: record.questForeignKey,
        });
      });

      allQuestions = await Promise.all(mapPromises);
    } else {
      allQuestions = await InfoQuestQuestions.find(filterObj)
        .sort(
          req.body.sort === "Newest First"
            ? { createdAt: -1 }
            : req.body.sort === "Last Updated"
            ? { lastInteractedAt: -1 }
            : req.body.sort === "Most Popular"
            ? { interactingCounter: -1 }
            : "createdAt"
        );
    }

    if (req.body.uuid === "" || req.body.uuid === undefined) {
      const resultArray = allQuestions.map(getPercentage);
      res.status(200).json(resultArray);
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

      const resultArray = Result.slice(start, end).map(getPercentage);
      const desiredArray = resultArray.map((item) => ({
        ...item._doc,
        selectedPercentage: item.selectedPercentage,
        contendedPercentage: item.contendedPercentage,
      }));
      res.status(200).json({
        data: desiredArray,
        hasNextPage: end < Result.length,
      });
    }
  } catch (err) {
    res.status(500).send(err);
  }
};
const getAllQuestsWithAnsweredStatus = async (req, res) => {
  try {
    let allQuestions;

    let filterObj = {};
    if (req.body.filter === true) {
      if (req.body.Page === "Bookmark") {
        filterObj.createdBy = req.body.uuid;
      } else {
        filterObj.uuid = req.body.uuid;
      }
    }

    if (req.body.type) {
      filterObj.whichTypeQuestion = req.body.type;
    }
    if (req.body.terms && req.body.terms.length > 0) {
      const regexTerm = req.body.terms.map((term) => new RegExp(term, "i"));
      filterObj.QuestTopic = { $in: regexTerm };
    } else if (req.body.blockedTerms && req.body.blockedTerms.length > 0) {
      const regexBlockterms = req.body.blockedTerms.map(
        (term) => new RegExp(term, "i")
      );
      filterObj.QuestTopic = { $nin: regexBlockterms };
    }

    if (req.body.Page === "Bookmark") {
      console.log("running");
      filterObj.uuid = req.body.uuid;
      const Questions = await BookmarkQuests.find(filterObj).sort(
        req.body.sort === "Newest First" ? { createdAt: -1 } : "createdAt"
      );

      const mapPromises = Questions.map(async function (record) {
        return await InfoQuestQuestions.findOne({
          _id: record.questForeignKey,
        });
      });

      allQuestions = await Promise.all(mapPromises);
    } else {
      allQuestions = await InfoQuestQuestions.find(filterObj)
        .sort(
          req.body.sort === "Newest First"
            ? { createdAt: -1 }
            : req.body.sort === "Last Updated"
            ? { lastInteractedAt: -1 }
            : req.body.sort === "Most Popular"
            ? { interactingCounter: -1 }
            : "createdAt"
        );
    }

    if (req.body.uuid === "" || req.body.uuid === undefined) {
      const resultArray = allQuestions.map(getPercentage);
      res.status(200).json(resultArray);
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
              rcrd.usersChangeTheirAns?.trim() !== "" ||
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

      const start = req.body.start;
      const end = req.body.end;
      console.log("Start" + start + "end" + end);

      const resultArray = Result.slice(start, end).map(getPercentage);
      const desiredArray = resultArray.map((item) => ({
        ...item._doc,
        selectedPercentage: item.selectedPercentage,
        contendedPercentage: item.contendedPercentage,
      }));

      res.status(200).json({
        data: desiredArray,
        hasNextPage: end < Result.length,
      });
    }
  } catch (err) {
    res.status(500).send(err);
  }
};

const getAllQuestsWithDefaultStatus = async (req, res) => {
  const { uuid, _page, _limit, filter, sort, type, Page, terms, blockedTerms } =
    req.body;
  const page = parseInt(_page);
  const pageSize = parseInt(_limit);

  // Calculate the number of documents to skip to get to the desired page
  const skip = (page - 1) * pageSize;
  let allQuestions = [];
  let filterObj = {};
  let totalQuestionsCount;

  if (filter === true) {
    if (Page === "Bookmark") {
      filterObj.createdBy = uuid;
    } else {
      filterObj.uuid = uuid;
    }
  }

  if (type) {
    filterObj.whichTypeQuestion = type;
  }
  if (terms && terms.length > 0) {
    const regexTerm = terms.map((term) => new RegExp(term, "i"));
    filterObj.QuestTopic = { $in: regexTerm };
  } else if (blockedTerms && blockedTerms.length > 0) {
    const regexBlockterms = blockedTerms.map((term) => new RegExp(term, "i"));
    filterObj.QuestTopic = { $nin: regexBlockterms };
  }

  if (Page === "Bookmark") {
    console.log("running");
    filterObj.uuid = uuid;
    const Questions = await BookmarkQuests.find(filterObj).sort(
      sort === "Newest First" ? { createdAt: -1 } : "createdAt"
    );

    const mapPromises = Questions.map(async function (record) {
      return await InfoQuestQuestions.findOne({
        _id: record.questForeignKey,
      });
    });

    allQuestions = await Promise.all(mapPromises);
    totalQuestionsCount = await BookmarkQuests.countDocuments(filterObj);
  } else {
    allQuestions = await InfoQuestQuestions.find(filterObj)
      .sort(
        sort === "Newest First"
          ? { createdAt: -1 }
          : sort === "Last Updated"
          ? { lastInteractedAt: -1 }
          : sort === "Most Popular"
          ? { interactingCounter: -1 }
          : "createdAt"
      ) // Sort by createdAt field in descending order
      .skip(skip)
      .limit(pageSize);
      totalQuestionsCount = await InfoQuestQuestions.countDocuments(filterObj);
  }

  const resultArray = allQuestions.map(getPercentage);
  const desiredArray = resultArray.map((item) => ({
    ...item._doc,
    selectedPercentage: item.selectedPercentage,
    contendedPercentage: item.contendedPercentage,
  }));

  // Query the database with skip and limit options to get questions for the requested page
  const result = await getQuestionsWithStatus(desiredArray, uuid);

  res.status(200).json({
    data: result,
    hasNextPage: skip + pageSize < totalQuestionsCount,
  });
};
const getAllQuestsWithResult = async (req, res) => {
  const { uuid, _page, _limit, filter, sort, type, Page, terms, blockedTerms } =
    req.body;
  const page = parseInt(_page);
  const pageSize = parseInt(_limit);

  // Calculate the number of documents to skip to get to the desired page
  const skip = (page - 1) * pageSize;
  let allQuestions = [];
  let filterObj = {};
  let totalQuestionsCount;

  if (filter === true) {
    if (Page === "Bookmark") {
      filterObj.createdBy = uuid;
    } else {
      filterObj.uuid = uuid;
    }
  }

  if (type) {
    filterObj.whichTypeQuestion = type;
  }
  if (terms && terms.length > 0) {
    const regexTerm = terms.map((term) => new RegExp(term, "i"));
    filterObj.QuestTopic = { $in: regexTerm };
  } else if (blockedTerms && blockedTerms.length > 0) {
    const regexBlockterms = blockedTerms.map((term) => new RegExp(term, "i"));
    filterObj.QuestTopic = { $nin: regexBlockterms };
  }

  if (Page === "Bookmark") {
    console.log("running");
    filterObj.uuid = uuid;
    const Questions = await BookmarkQuests.find(filterObj).sort(
      sort === "Newest First" ? { createdAt: -1 } : "createdAt"
    );

    const mapPromises = Questions.map(async function (record) {
      return await InfoQuestQuestions.findOne({
        _id: record.questForeignKey,
      });
    });

    allQuestions = await Promise.all(mapPromises);
    totalQuestionsCount = await BookmarkQuests.countDocuments(filterObj);
  } else {
    allQuestions = await InfoQuestQuestions.find(filterObj)
      .sort(
        sort === "Newest First"
          ? { createdAt: -1 }
          : sort === "Last Updated"
          ? { lastInteractedAt: -1 }
          : sort === "Most Popular"
          ? { interactingCounter: -1 }
          : "createdAt"
      ) // Sort by createdAt field in descending order
      .skip(skip)
      .limit(pageSize);
    totalQuestionsCount = await InfoQuestQuestions.countDocuments(filterObj);
  }

  const resultArray = allQuestions.map(getPercentage);

  // Query the database with skip and limit options to get questions for the requested page

  const result = await getQuestionsWithStatus(resultArray, uuid);

  res.status(200).json({
    data: result,
    hasNextPage: skip + pageSize < totalQuestionsCount,
  });
};

const getQuestById = async (req, res) => {
  try {
    const { uuid, id } = req.params; // Use req.params instead of req.body
    const infoQuest = await InfoQuestQuestions.find({
      _id: id,
    });
    if (!infoQuest) throw new Error("No Quest Exist!");

    const result = await getQuestionsWithStatus(infoQuest, uuid);

    res.status(200).json({
      data: result,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: `An error occurred while getQuestById InfoQuest: ${error.message}`,
    });
  }
};

const getAllQuestsWithCompletedStatus = async (req, res) => {
  try {
    let allQuestions;

    let filterObj = {};
    if (req.body.filter === true) {
      if (req.body.Page === "Bookmark") {
        filterObj.createdBy = req.body.uuid;
      } else {
        filterObj.uuid = req.body.uuid;
      }
    }

    if (req.body.type) {
      filterObj.whichTypeQuestion = req.body.type;
    }
    if (req.body.terms && req.body.terms.length > 0) {
      const regexTerm = req.body.terms.map((term) => new RegExp(term, "i"));
      filterObj.QuestTopic = { $in: regexTerm };
    } else if (req.body.blockedTerms && req.body.blockedTerms.length > 0) {
      const regexBlockterms = req.body.blockedTerms.map(
        (term) => new RegExp(term, "i")
      );
      filterObj.QuestTopic = { $nin: regexBlockterms };
    }

    if (req.body.Page === "Bookmark") {
      console.log("running");
      filterObj.uuid = req.body.uuid;
      const Questions = await BookmarkQuests.find(filterObj).sort(
        req.body.sort === "Newest First" ? { createdAt: -1 } : "createdAt"
      );

      const mapPromises = Questions.map(async function (record) {
        return await InfoQuestQuestions.findOne({
          _id: record.questForeignKey,
        });
      });

      allQuestions = await Promise.all(mapPromises);
    } else {
      allQuestions = await InfoQuestQuestions.find(filterObj)
        .sort(
          req.body.sort === "Newest First"
            ? { createdAt: -1 }
            : req.body.sort === "Last Updated"
            ? { lastInteractedAt: -1 }
            : req.body.sort === "Most Popular"
            ? { interactingCounter: -1 }
            : "createdAt"
        );
    }

    if (req.body.uuid === "" || req.body.uuid === undefined) {
      const resultArray = allQuestions.map(getPercentage);
      res.status(200).json(resultArray);
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
              rcrd.usersChangeTheirAns?.trim() !== "" ||
              rcrd.whichTypeQuestion === "ranked choise"
            ) {
            } else {
              rcrd.startStatus = "completed";
              Result.push(rcrd);
            }
          }
        });
      });

      const start = req.body.start;
      const end = req.body.end;
      console.log("Start" + start + "end" + end);

      const resultArray = Result.slice(start, end).map(getPercentage);
      const desiredArray = resultArray.map((item) => ({
        ...item._doc,
        selectedPercentage: item.selectedPercentage,
        contendedPercentage: item.contendedPercentage,
      }));
      res.status(200).json({
        data: desiredArray,
        hasNextPage: end < Result.length,
      });
    }
  } catch (err) {
    res.status(500).send(err);
  }
};
const getAllQuestsWithChangeAnsStatus = async (req, res) => {
  try {
    let allQuestions;

    let filterObj = {};
    if (req.body.filter === true) {
      if (req.body.Page === "Bookmark") {
        filterObj.createdBy = req.body.uuid;
      } else {
        filterObj.uuid = req.body.uuid;
      }
    }

    if (req.body.type) {
      filterObj.whichTypeQuestion = req.body.type;
    }
    if (req.body.terms && req.body.terms.length > 0) {
      const regexTerm = req.body.terms.map((term) => new RegExp(term, "i"));
      filterObj.QuestTopic = { $in: regexTerm };
    } else if (req.body.blockedTerms && req.body.blockedTerms.length > 0) {
      const regexBlockterms = req.body.blockedTerms.map(
        (term) => new RegExp(term, "i")
      );
      filterObj.QuestTopic = { $nin: regexBlockterms };
    }

    if (req.body.Page === "Bookmark") {
      console.log("running");
      filterObj.uuid = req.body.uuid;
      const Questions = await BookmarkQuests.find(filterObj).sort(
        req.body.sort === "Newest First" ? { createdAt: -1 } : "createdAt"
      );

      const mapPromises = Questions.map(async function (record) {
        return await InfoQuestQuestions.findOne({
          _id: record.questForeignKey,
        });
      });

      allQuestions = await Promise.all(mapPromises);
    } else {
      allQuestions = await InfoQuestQuestions.find(filterObj)
        .sort(
          req.body.sort === "Newest First"
            ? { createdAt: -1 }
            : req.body.sort === "Last Updated"
            ? { lastInteractedAt: -1 }
            : req.body.sort === "Most Popular"
            ? { interactingCounter: -1 }
            : "createdAt"
        );
    }

    if (req.body.uuid === "" || req.body.uuid === undefined) {
      const resultArray = allQuestions.map(getPercentage);
      res.status(200).json(resultArray);
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
            rcrd.usersChangeTheirAns?.trim() !== "" ||
            rcrd.whichTypeQuestion === "ranked choise"
          ) {
            rcrd.startStatus = "change answer";
            Result.push(rcrd);
          }
        }
      });
      const start = req.body.start;
      const end = req.body.end;

      const resultArray = Result.slice(start, end).map(getPercentage);
      const desiredArray = resultArray.map((item) => ({
        ...item._doc,
        selectedPercentage: item.selectedPercentage,
        contendedPercentage: item.contendedPercentage,
      }));

      res.status(200).json({
        data: desiredArray,
        hasNextPage: end < Result.length,
      });
    }
  } catch (err) {
    res.status(500).send(err);
  }
};

async function getQuestionsWithStatus(allQuestions, uuid) {
  try {
    if (uuid === "" || uuid === undefined) {
      return allQuestions;
    } else {
      const startedQuestions = await StartQuests.find({
        uuid: uuid,
      });
      console.log("🚀 ~ getQuestionsWithStatus ~ startedQuestions:", startedQuestions)

      let Result = [];
      await allQuestions.map(async function (rcrd) {
        await startedQuestions.map(function (rec) {
          if (rec.questForeignKey === rcrd?._id?.toString()) {
            if (
              rcrd.usersChangeTheirAns?.trim() !== "" ||
              rcrd.whichTypeQuestion === "ranked choise"
            ) {
              rcrd.startStatus = "change answer";
              rcrd.startQuestData = rec
            } else {
              rcrd.startStatus = "completed";
              rcrd.startQuestData = rec
            }
          }
        });

        Result.push(rcrd);
      });

      console.log("🚀 ~ getQuestionsWithStatus ~ Result:", Result)
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
  getAllQuestsWithResult,
  getQuestById,
  getAllQuestsWithCompletedStatus,
  getAllQuestsWithChangeAnsStatus,
  getQuestionsWithStatus,
};
