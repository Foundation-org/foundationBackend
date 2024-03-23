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
const shortLink = require("shortlink");
const UserQuestSetting = require("../models/UserQuestSetting");

const createInfoQuestQuest = async (req, res) => {
  try {
    const userBalance = await getUserBalance(req.body.uuid);
    if (userBalance < QUEST_CREATED_AMOUNT)
      throw new Error("The balance is insufficient to create a Quest!");
    // Find the user by uuid
    const user = await User.findOne({ uuid: req.body.uuid });

    if (!user) {
      return res.status(404).send("User not found");
    }
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
      getUserBadge: user._id,
      uniqueShareLink: shortLink.generate(8),
      moderationRatingCount: req.body.moderationRatingCount,
    });

    const createdQuestion = await question.save();
    if (!createdQuestion) {
      return res.status(404).send("Not Created 1");
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
      txUserAction: "postCreated",
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
      txUserAction: "postCreated",
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
    const { moderationRatingFilter } = req.body;
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
      filterObj.QuestTopic = { $in: regexBlockterms };
    }

    if (req.body.Page === "Bookmark") {
      //  filterObj.uuid=req.body.uuid;
      const hiddenUserSettings = await UserQuestSetting.find({
        hidden: true,
        uuid: req.body.uuid,
      });

      // Extract userSettingIds from hiddenUserSettings
      const hiddenUserSettingIds = hiddenUserSettings.map(
        (userSetting) => userSetting.questForeignKey
      );
      // filterObj.uuid = req.body.uuid;
      const Questions = await BookmarkQuests.find({
        questForeignKey: { $nin: hiddenUserSettingIds },
        uuid: req.body.uuid,
        ...filterObj,
      }).sort(
        req.body.sort === "Newest First" ? { createdAt: -1 } : "createdAt"
      );

      const mapPromises = Questions.map(async function (record) {
        return await InfoQuestQuestions.findOne({
          _id: record.questForeignKey,
          ...filterObj,
          moderationRatingCount : { $gte: moderationRatingFilter?.initial, $lte: moderationRatingFilter?.final }
        }).populate("getUserBadge", "badges");
      });

      allQuestions = await Promise.all(mapPromises);
      allQuestions = allQuestions.filter((question) => question !== null);
    } else if (req.body.Page === "Hidden") {
      console.log("running");
      filterObj.uuid = uuid;
      filterObj.hidden = true;
      const Questions = await UserQuestSetting.find(filterObj).sort(
        sort === "Newest First" ? { createdAt: -1 } : "createdAt"
      );

      const mapPromises = Questions.map(async function (record) {
        return await InfoQuestQuestions.findOne({
          _id: record.questForeignKey,
        }).populate("getUserBadge", "badges");
      });

      allQuestions = await Promise.all(mapPromises);
      totalQuestionsCount = await UserQuestSetting.countDocuments(filterObj);
    } else if (req.body.Page === "SharedLink") {
      console.log("running");
      filterObj.uuid = uuid;
      filterObj.linkStatus = "Enable";
      const Questions = await UserQuestSetting.find(filterObj).sort(
        sort === "Newest First" ? { createdAt: -1 } : "createdAt"
      );

      const mapPromises = Questions.map(async function (record) {
        return await InfoQuestQuestions.findOne({
          _id: record.questForeignKey,
        }).populate("getUserBadge", "badges");
      });

      allQuestions = await Promise.all(mapPromises);
      totalQuestionsCount = await UserQuestSetting.countDocuments(filterObj);
    } else {
      // moderation filter
      filterObj.moderationRatingCount = { $gte: moderationRatingFilter?.initial, $lte: moderationRatingFilter?.final }
      // First, find UserQuestSettings with hidden: false
      const hiddenUserSettings = await UserQuestSetting.find({
        hidden: true,
        uuid: req.body.uuid,
      });

      // Extract userSettingIds from hiddenUserSettings
      const hiddenUserSettingIds = hiddenUserSettings.map(
        (userSetting) => userSetting.questForeignKey
      );

      allQuestions = await InfoQuestQuestions.find({
        _id: { $nin: hiddenUserSettingIds },
        ...filterObj,
      })
        .sort(
          req.body.sort === "Newest First"
            ? { createdAt: -1 }
            : req.body.sort === "Last Updated"
            ? { lastInteractedAt: -1 }
            : req.body.sort === "Most Popular"
            ? { interactingCounter: -1 }
            : "createdAt"
        )
        .populate("getUserBadge", "badges");
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
    console.log(err);
    res.status(500).send(err);
  }
};
const getAllQuestsWithAnsweredStatus = async (req, res) => {
  try {
    const { moderationRatingFilter } = req.body;
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
      filterObj.QuestTopic = { $in: regexBlockterms };
    }

    if (req.body.Page === "Bookmark") {
      // filterObj.uuid=req.body.uuid;
      const hiddenUserSettings = await UserQuestSetting.find({
        hidden: true,
        uuid: req.body.uuid,
      });

      // Extract userSettingIds from hiddenUserSettings
      const hiddenUserSettingIds = hiddenUserSettings.map(
        (userSetting) => userSetting.questForeignKey
      );
      // filterObj.uuid = req.body.uuid;
      const Questions = await BookmarkQuests.find({
        questForeignKey: { $nin: hiddenUserSettingIds },
        uuid: req.body.uuid,
        ...filterObj,
      }).sort(
        req.body.sort === "Newest First" ? { createdAt: -1 } : "createdAt"
      );

      const mapPromises = Questions.map(async function (record) {
        return await InfoQuestQuestions.findOne({
          _id: record.questForeignKey,
          ...filterObj,
          moderationRatingCount : { $gte: moderationRatingFilter?.initial, $lte: moderationRatingFilter?.final }
        }).populate("getUserBadge", "badges");
      });

      allQuestions = await Promise.all(mapPromises);
      allQuestions = allQuestions.filter((question) => question !== null);
    } else if (req.body.Page === "Hidden") {
      console.log("running");
      filterObj.uuid = uuid;
      filterObj.hidden = true;
      const Questions = await UserQuestSetting.find(filterObj).sort(
        sort === "Newest First" ? { createdAt: -1 } : "createdAt"
      );

      const mapPromises = Questions.map(async function (record) {
        return await InfoQuestQuestions.findOne({
          _id: record.questForeignKey,
        }).populate("getUserBadge", "badges");
      });

      allQuestions = await Promise.all(mapPromises);
      totalQuestionsCount = await UserQuestSetting.countDocuments(filterObj);
    } else if (req.body.Page === "SharedLink") {
      console.log("running");
      filterObj.uuid = uuid;
      filterObj.linkStatus = "Enable";
      const Questions = await UserQuestSetting.find(filterObj).sort(
        sort === "Newest First" ? { createdAt: -1 } : "createdAt"
      );

      const mapPromises = Questions.map(async function (record) {
        return await InfoQuestQuestions.findOne({
          _id: record.questForeignKey,
        }).populate("getUserBadge", "badges");
      });

      allQuestions = await Promise.all(mapPromises);
      totalQuestionsCount = await UserQuestSetting.countDocuments(filterObj);
    } else {
      // moderation filter
      filterObj.moderationRatingCount = { $gte: moderationRatingFilter?.initial, $lte: moderationRatingFilter?.final }
      // First, find UserQuestSettings with hidden: false
      const hiddenUserSettings = await UserQuestSetting.find({
        hidden: true,
        uuid: req.body.uuid,
      });

      // Extract userSettingIds from hiddenUserSettings
      const hiddenUserSettingIds = hiddenUserSettings.map(
        (userSetting) => userSetting.questForeignKey
      );

      allQuestions = await InfoQuestQuestions.find({
        _id: { $nin: hiddenUserSettingIds },
        ...filterObj,
      })
        .sort(
          req.body.sort === "Newest First"
            ? { createdAt: -1 }
            : req.body.sort === "Last Updated"
            ? { lastInteractedAt: -1 }
            : req.body.sort === "Most Popular"
            ? { interactingCounter: -1 }
            : "createdAt"
        )
        .populate("getUserBadge", "badges");
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
            rcrd.startQuestData = rec;
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
    console.log(err);
  }
};

const getAllQuestsWithDefaultStatus = async (req, res) => {
  const {
    uuid,
    _page,
    _limit,
    filter,
    sort,
    type,
    Page,
    terms,
    blockedTerms,
    moderationRatingFilter,
  } = req.body;
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
    // const regexBlockterms = blockedTerms.map((term) => new RegExp(term, "i"));
    filterObj.QuestTopic = { $in: blockedTerms };

    // const hiddenQuestList = await InfoQuestQuestions.find({
    //   QuestTopic: { $in: blockedTerms },
    // });

    // const mapPromises = hiddenQuestList.map(async (item) => {
    //   const userQuestSettingExist = await UserQuestSetting.findOne({
    //     uuid: uuid,
    //     questForeignKey: item._id,
    //   });

    //   if (userQuestSettingExist) {
    //     // If userQuestSetting exists, update it
    //     await UserQuestSetting.findOneAndUpdate(
    //       { uuid: uuid, questForeignKey: item._id },
    //       { hidden: true }
    //     );
    //   } else {
    //     // If userQuestSetting does not exist, create it
    //     await UserQuestSetting.create({
    //       uuid: uuid,
    //       questForeignKey: item._id,
    //       hidden: true,
    //     });
    //   }
    // });

    // // Use Promise.allSettled to handle errors without stopping execution
    // await Promise.allSettled(mapPromises);
  }

  if (Page === "Bookmark") {
    const hiddenUserSettings = await UserQuestSetting.find({
      hidden: true,
      uuid,
    });

    // Extract userSettingIds from hiddenUserSettings
    const hiddenUserSettingIds = hiddenUserSettings.map(
      (userSetting) => userSetting.questForeignKey
    );

    // filterObj.uuid = uuid;
    const Questions = await BookmarkQuests.find({
      questForeignKey: { $nin: hiddenUserSettingIds },
      uuid: uuid,
    })
      .sort(sort === "Newest First" ? { createdAt: -1 } : "createdAt")
      .skip(skip)
      .limit(pageSize);

    const mapPromises = Questions.map(async function (record) {
      return await InfoQuestQuestions.findOne({
        _id: record.questForeignKey,
        ...filterObj,
        moderationRatingCount : { $gte: moderationRatingFilter?.initial, $lte: moderationRatingFilter?.final }
      });
    });
    console.log(mapPromises);

    allQuestions = await Promise.all(mapPromises);
    allQuestions = allQuestions.filter((question) => question !== null);
    totalQuestionsCount = await BookmarkQuests.countDocuments({
      questForeignKey: { $nin: hiddenUserSettingIds },
      uuid: uuid,
    });
  } else if (Page === "Hidden") {
    console.log("running");
    filterObj.uuid = uuid;
    filterObj.hidden = true;
    const Questions = await UserQuestSetting.find(filterObj)
      .sort(sort === "Newest First" ? { createdAt: -1 } : "createdAt")
      .skip(skip)
      .limit(pageSize);

    const mapPromises = Questions.map(async function (record) {
      return await InfoQuestQuestions.findOne({
        _id: record.questForeignKey,
      }).populate("getUserBadge", "badges");
    });

    allQuestions = await Promise.all(mapPromises);
    totalQuestionsCount = await UserQuestSetting.countDocuments(filterObj);
  } else if (req.body.Page === "SharedLink") {
    console.log("running");
    filterObj.uuid = uuid;
    filterObj.linkStatus = { $in: ["Enable", "Disable"] };
    console.log("filterObj", filterObj);
    const Questions = await UserQuestSetting.find(filterObj)
      .sort(sort === "Newest First" ? { createdAt: -1 } : "createdAt")
      .limit(pageSize)
      .skip(skip);

    const mapPromises = Questions.map(async function (record) {
      return await InfoQuestQuestions.findOne({
        _id: record.questForeignKey,
      }).populate("getUserBadge", "badges");
    });

    allQuestions = await Promise.all(mapPromises);
    totalQuestionsCount = await UserQuestSetting.countDocuments(filterObj);
  } else {
    // moderation filter
    filterObj.moderationRatingCount = { $gte: moderationRatingFilter?.initial, $lte: moderationRatingFilter?.final }
    // First, find UserQuestSettings with hidden: false
    const hiddenUserSettings = await UserQuestSetting.find({
      hidden: true,
      uuid,
    });

    // Extract userSettingIds from hiddenUserSettings
    const hiddenUserSettingIds = hiddenUserSettings.map(
      (userSetting) => userSetting.questForeignKey
    );

    console.log("🚀 ~ getAllQuestsWithDefaultStatus ~ filterObj:", filterObj);
    allQuestions = await InfoQuestQuestions.find({
      _id: { $nin: hiddenUserSettingIds },
      ...filterObj,
    })
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
      .limit(pageSize)
      .populate("getUserBadge", "badges");
    totalQuestionsCount = await InfoQuestQuestions.countDocuments({
      _id: { $nin: hiddenUserSettingIds },
      ...filterObj,
    });
  }

  const resultArray = allQuestions.map((item) => getPercentage(item));
  const desiredArray = resultArray.map((item) => ({
    ...item._doc,
    selectedPercentage: item?.selectedPercentage?.[0]
      ? [
          Object.fromEntries(
            Object.entries(item.selectedPercentage[0]).sort(
              (a, b) => parseInt(b[1]) - parseInt(a[1])
            )
          ),
        ]
      : [],
    contendedPercentage: item?.contendedPercentage?.[0]
      ? [
          Object.fromEntries(
            Object.entries(item.contendedPercentage[0]).sort(
              (a, b) => parseInt(b[1]) - parseInt(a[1])
            )
          ),
        ]
      : [],
  }));
  // Query the database with skip and limit options to get questions for the requested page
  const result = await getQuestionsWithStatus(desiredArray, uuid);

  // getQuestionsWithUserSettings
  const result1 = await getQuestionsWithUserSettings(result, uuid);

  res.status(200).json({
    data: result1,
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
    // const regexBlockterms = blockedTerms.map((term) => new RegExp(term, "i"));
    filterObj.QuestTopic = { $in: blockedTerms };
  }

  if (Page === "Bookmark") {
    const hiddenUserSettings = await UserQuestSetting.find({
      hidden: true,
      uuid,
    });

    // Extract userSettingIds from hiddenUserSettings
    const hiddenUserSettingIds = hiddenUserSettings.map(
      (userSetting) => userSetting.questForeignKey
    );

    // filterObj.uuid = uuid;
    const Questions = await BookmarkQuests.find({
      questForeignKey: { $nin: hiddenUserSettingIds },
      uuid: uuid,
    }).sort(sort === "Newest First" ? { createdAt: -1 } : "createdAt");

    const mapPromises = Questions.map(async function (record) {
      return await InfoQuestQuestions.findOne({
        _id: record.questForeignKey,
        ...filterObj,
      }).populate("getUserBadge", "badges");
    });

    allQuestions = await Promise.all(mapPromises);
    allQuestions = allQuestions.filter((question) => question !== null);
    totalQuestionsCount = await BookmarkQuests.countDocuments(filterObj);
  } else if (Page === "Hidden") {
    console.log("running");
    filterObj.uuid = uuid;
    filterObj.hidden = true;
    const Questions = await UserQuestSetting.find(filterObj).sort(
      sort === "Newest First" ? { createdAt: -1 } : "createdAt"
    );

    const mapPromises = Questions.map(async function (record) {
      return await InfoQuestQuestions.findOne({
        _id: record.questForeignKey,
      }).populate("getUserBadge", "badges");
    });

    allQuestions = await Promise.all(mapPromises);
    totalQuestionsCount = await UserQuestSetting.countDocuments(filterObj);
  } else if (req.body.Page === "SharedLink") {
    console.log("running");
    filterObj.uuid = uuid;
    filterObj.linkStatus = "Enable";
    const Questions = await UserQuestSetting.find(filterObj).sort(
      sort === "Newest First" ? { createdAt: -1 } : "createdAt"
    );

    const mapPromises = Questions.map(async function (record) {
      return await InfoQuestQuestions.findOne({
        _id: record.questForeignKey,
      }).populate("getUserBadge", "badges");
    });

    allQuestions = await Promise.all(mapPromises);
    totalQuestionsCount = await UserQuestSetting.countDocuments(filterObj);
  } else {
    // First, find UserQuestSettings with hidden: false
    const hiddenUserSettings = await UserQuestSetting.find({
      hidden: true,
      uuid,
    });

    // Extract userSettingIds from hiddenUserSettings
    const hiddenUserSettingIds = hiddenUserSettings.map(
      (userSetting) => userSetting.questForeignKey
    );

    allQuestions = await InfoQuestQuestions.find({
      _id: { $nin: hiddenUserSettingIds },
      ...filterObj,
    })
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
  // getQuestionsWithUserSettings
  const result1 = await getQuestionsWithUserSettings(result, uuid);

  res.status(200).json({
    data: result1,
    hasNextPage: skip + pageSize < totalQuestionsCount,
  });
};

const getQuestById = async (req, res) => {
  try {
    const { uuid, id, page } = req.params; // Use req.params instead of req.body
    const { postLink } = req.query;
    const infoQuest = await InfoQuestQuestions.find({
      _id: id,
    }).populate("getUserBadge", "badges");
    if (!infoQuest) throw new Error("No Quest Exist!");

    const result = await getQuestionsWithStatus(infoQuest, uuid);
    // getQuestionsWithUserSettings
    const result1 = await getQuestionsWithUserSettings(result, uuid);

    let quest;

    if (page === "SharedLink") {
      quest = await UserQuestSetting.findOne({ link: postLink });
    }
    console.log("questSharedLink", quest);

    const resultArray = result1.map((item) => getPercentage(item, page, quest));

    const desiredArray = resultArray.map((item) => ({
      ...item._doc,
      selectedPercentage: item.selectedPercentage,
      contendedPercentage: item.contendedPercentage,
      userQuestSetting: item.userQuestSetting,
    }));

    res.status(200).json({
      data: desiredArray,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: `An error occurred while getQuestById InfoQuest: ${error.message}`,
    });
  }
};

const getQuestByUniqueShareLink = async (req, res) => {
  try {
    // req.cookie
    console.log("🚀 ~ getQuestById ~ req.cookie:", req.cookies);
    // return
    const uuid = req.cookies.uuid;
    const { uniqueShareLink } = req.params; // Use req.params instead of req.body

    const userQuestSetting = await UserQuestSetting.findOne({
      // uuid,
      link: uniqueShareLink,
      linkStatus: "Enable",
    });

    if (!userQuestSetting) {
      // If the document doesn't exist, you may want to handle this case
      return res
        .status(404)
        .json({ status: false, message: "This link is not active" });
    }

    const infoQuest = await InfoQuestQuestions.find({
      _id: userQuestSetting.questForeignKey,
    }).populate("getUserBadge", "badges");
    if (!infoQuest) throw new Error("No Post Exist!");

    const result = await getQuestionsWithStatus(infoQuest, uuid);

    // getQuestionsWithUserSettings
    const result1 = await getQuestionsWithUserSettings(result, uuid);

    const resultArray = result1.map(getPercentage);
    const desiredArray = resultArray.map((item) => ({
      ...item._doc,
      selectedPercentage: item.selectedPercentage,
      contendedPercentage: item.contendedPercentage,
    }));

    res.status(200).json({
      data: desiredArray,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: `An error occurred while getQuestByUniqueShareLink InfoQuest: ${error.message}`,
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
      filterObj.QuestTopic = { $in: regexBlockterms };
    }

    if (req.body.Page === "Bookmark") {
      // filterObj.uuid=req.body.uuid;
      const hiddenUserSettings = await UserQuestSetting.find({
        hidden: true,
        uuid: req.body.uuid,
      });

      // Extract userSettingIds from hiddenUserSettings
      const hiddenUserSettingIds = hiddenUserSettings.map(
        (userSetting) => userSetting.questForeignKey
      );
      // filterObj.uuid = req.body.uuid;
      const Questions = await BookmarkQuests.find({
        questForeignKey: { $nin: hiddenUserSettingIds },
        uuid: req.body.uuid,
        ...filterObj,
      }).sort(
        req.body.sort === "Newest First" ? { createdAt: -1 } : "createdAt"
      );

      const mapPromises = Questions.map(async function (record) {
        return await InfoQuestQuestions.findOne({
          _id: record.questForeignKey,
          ...filterObj,
        }).populate("getUserBadge", "badges");
      });

      allQuestions = await Promise.all(mapPromises);
      allQuestions = allQuestions.filter((question) => question !== null);
    } else if (req.body.Page === "Hidden") {
      console.log("running");
      filterObj.uuid = uuid;
      filterObj.hidden = true;
      const Questions = await UserQuestSetting.find(filterObj).sort(
        sort === "Newest First" ? { createdAt: -1 } : "createdAt"
      );

      const mapPromises = Questions.map(async function (record) {
        return await InfoQuestQuestions.findOne({
          _id: record.questForeignKey,
        }).populate("getUserBadge", "badges");
      });

      allQuestions = await Promise.all(mapPromises);
      totalQuestionsCount = await UserQuestSetting.countDocuments(filterObj);
    } else if (req.body.Page === "SharedLink") {
      console.log("running");
      filterObj.uuid = uuid;
      filterObj.linkStatus = "Enable";
      const Questions = await UserQuestSetting.find(filterObj).sort(
        sort === "Newest First" ? { createdAt: -1 } : "createdAt"
      );

      const mapPromises = Questions.map(async function (record) {
        return await InfoQuestQuestions.findOne({
          _id: record.questForeignKey,
        }).populate("getUserBadge", "badges");
      });

      allQuestions = await Promise.all(mapPromises);
      totalQuestionsCount = await UserQuestSetting.countDocuments(filterObj);
    } else {
      // First, find UserQuestSettings with hidden: false
      const hiddenUserSettings = await UserQuestSetting.find({
        hidden: true,
        uuid,
      });

      // Extract userSettingIds from hiddenUserSettings
      const hiddenUserSettingIds = hiddenUserSettings.map(
        (userSetting) => userSetting.questForeignKey
      );

      allQuestions = await InfoQuestQuestions.find({
        _id: { $nin: hiddenUserSettingIds },
        ...filterObj,
      })
        .sort(
          req.body.sort === "Newest First"
            ? { createdAt: -1 }
            : req.body.sort === "Last Updated"
            ? { lastInteractedAt: -1 }
            : req.body.sort === "Most Popular"
            ? { interactingCounter: -1 }
            : "createdAt"
        )
        .populate("getUserBadge", "badges");
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
      // filterObj.uuid=req.body.uuid;
      const hiddenUserSettings = await UserQuestSetting.find({
        hidden: true,
        uuid: req.body.uuid,
      });

      // Extract userSettingIds from hiddenUserSettings
      const hiddenUserSettingIds = hiddenUserSettings.map(
        (userSetting) => userSetting.questForeignKey
      );
      // filterObj.uuid = req.body.uuid;
      const Questions = await BookmarkQuests.find({
        questForeignKey: { $nin: hiddenUserSettingIds },
        uuid: req.body.uuid,
        ...filterObj,
      }).sort(
        req.body.sort === "Newest First" ? { createdAt: -1 } : "createdAt"
      );

      const mapPromises = Questions.map(async function (record) {
        return await InfoQuestQuestions.findOne({
          _id: record.questForeignKey,
          ...filterObj,
        }).populate("getUserBadge", "badges");
      });

      allQuestions = await Promise.all(mapPromises);
      allQuestions = allQuestions.filter((question) => question !== null);
    } else if (req.body.Page === "Hidden") {
      console.log("running");
      filterObj.uuid = uuid;
      filterObj.hidden = true;
      const Questions = await UserQuestSetting.find(filterObj).sort(
        sort === "Newest First" ? { createdAt: -1 } : "createdAt"
      );

      const mapPromises = Questions.map(async function (record) {
        return await InfoQuestQuestions.findOne({
          _id: record.questForeignKey,
        }).populate("getUserBadge", "badges");
      });

      allQuestions = await Promise.all(mapPromises);
      totalQuestionsCount = await UserQuestSetting.countDocuments(filterObj);
    } else if (req.body.Page === "SharedLink") {
      console.log("running");
      filterObj.uuid = uuid;
      filterObj.linkStatus = "Enable";
      const Questions = await UserQuestSetting.find(filterObj).sort(
        sort === "Newest First" ? { createdAt: -1 } : "createdAt"
      );

      const mapPromises = Questions.map(async function (record) {
        return await InfoQuestQuestions.findOne({
          _id: record.questForeignKey,
        }).populate("getUserBadge", "badges");
      });

      allQuestions = await Promise.all(mapPromises);
      totalQuestionsCount = await UserQuestSetting.countDocuments(filterObj);
    } else {
      // First, find UserQuestSettings with hidden: false
      const hiddenUserSettings = await UserQuestSetting.find({
        hidden: true,
        uuid,
      });

      // Extract userSettingIds from hiddenUserSettings
      const hiddenUserSettingIds = hiddenUserSettings.map(
        (userSetting) => userSetting.questForeignKey
      );

      allQuestions = await InfoQuestQuestions.find({
        _id: { $nin: hiddenUserSettingIds },
        ...filterObj,
      })
        .sort(
          req.body.sort === "Newest First"
            ? { createdAt: -1 }
            : req.body.sort === "Last Updated"
            ? { lastInteractedAt: -1 }
            : req.body.sort === "Most Popular"
            ? { interactingCounter: -1 }
            : "createdAt"
        )
        .populate("getUserBadge", "badges");
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
            rcrd.startQuestData = rec;
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

      let Result = [];
      await allQuestions.map(async function (rcrd) {
        await startedQuestions.map(function (rec) {
          if (rec.questForeignKey === rcrd?._id?.toString()) {
            if (
              rcrd.usersChangeTheirAns?.trim() !== "" ||
              rcrd.whichTypeQuestion === "ranked choise"
            ) {
              rcrd.startStatus = "change answer";
              rcrd.startQuestData = rec;
            } else {
              rcrd.startStatus = "completed";
              rcrd.startQuestData = rec;
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

async function getQuestionsWithUserSettings(allQuestions, uuid) {
  try {
    if (uuid === "" || uuid === undefined) {
      return allQuestions;
    } else {
      const userQuestSettings = await UserQuestSetting.find({
        uuid: uuid,
      });
      // console.log(
      //   "🚀 ~ getQuestionsWithUserSettings ~ userQuestSettings:",
      //   userQuestSettings
      // );

      let Result = [];
      await allQuestions.map(async function (rcrd) {
        await userQuestSettings.map(function (rec) {
          if (rec.questForeignKey === rcrd?._id?.toString()) {
            rcrd.userQuestSetting = rec;
            // if (
            //   rcrd.usersChangeTheirAns?.trim() !== "" ||
            //   rcrd.whichTypeQuestion === "ranked choise"
            // ) {
            //   rcrd.startStatus = "change answer";
            //   rcrd.startQuestData = rec;
            // } else {
            //   rcrd.startStatus = "completed";
            //   rcrd.startQuestData = rec;
            // }
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
  getAllQuestsWithResult,
  getQuestById,
  getAllQuestsWithCompletedStatus,
  getAllQuestsWithChangeAnsStatus,
  getQuestionsWithStatus,
  getQuestByUniqueShareLink,
  getQuestionsWithUserSettings,
};
