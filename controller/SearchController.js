const InfoQuestQuestions = require("../models/InfoQuestQuestions");
const BookmarkQuests = require("../models/BookmarkQuests");
const {
  getQuestionsWithStatus,
  getQuestionsWithUserSettings,
} = require("./InfoQuestQuestionController");
const { getPercentage } = require("../utils/getPercentage");
const UserQuestSetting = require("../models/UserQuestSetting");

const easySearch = async (req, res) => {
  const searchTerm = req.query.term || "";
  const uuid = req.cookies.uuid;

  try {
    const hiddenUserSettings = await UserQuestSetting.find({
      hidden: true,
      uuid,
    });

    // Extract userSettingIds from hiddenUserSettings
    const hiddenUserSettingIds = hiddenUserSettings.map(
      (userSetting) => userSetting.questForeignKey
    );
    const results = await InfoQuestQuestions.find({
      $or: [
        { Question: { $regex: searchTerm, $options: "i" } },
        { whichTypeQuestion: { $regex: searchTerm, $options: "i" } },
        { "QuestAnswers.question": { $regex: searchTerm, $options: "i" } },
        { QuestTopic: { $regex: searchTerm, $options: "i" } },
      ],
      _id: { $nin: hiddenUserSettingIds },
    }).populate("getUserBadge", "badges");

    const resultArray = results.map(getPercentage);
    const desiredArray = resultArray.map((item) => ({
      ...item._doc,
      selectedPercentage: item.selectedPercentage,
      contendedPercentage: item.contendedPercentage,
    }));

    // Query the database with skip and limit options to get questions for the requested page
    const result = await getQuestionsWithStatus(desiredArray, uuid);

    // getQuestionsWithUserSettings
    const result1 = await getQuestionsWithUserSettings(result, uuid);

    res.status(200).json({
      data: result1,
      hasNextPage: false,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const searchBookmarks = async (req, res) => {
  const searchTerm = req.query.term;
  const uuid = req.cookies.uuid;
  try {
    const hiddenUserSettings = await UserQuestSetting.find({
      hidden: true,
      uuid,
    });
    console.log("wamiq", hiddenUserSettings);

    // Extract userSettingIds from hiddenUserSettings
    const hiddenUserSettingIds = hiddenUserSettings.map(
      (userSetting) => userSetting.questForeignKey
    );
    console.log("wamiq2", hiddenUserSettingIds);

    const results = await BookmarkQuests.find({
      questForeignKey: { $nin: hiddenUserSettingIds },
      Question: { $regex: searchTerm, $options: "i" },
      uuid: uuid,
    });


    const reversedResults = results.reverse();
    const mapPromises = reversedResults.map(async function (record) {
      return await InfoQuestQuestions.findOne({
        _id: record.questForeignKey,
      });
    });

    const allQuestions = await Promise.all(mapPromises);

    const resultArray = allQuestions.map(getPercentage);
    const desiredArray = resultArray.map((item) => ({
      ...item._doc,
      selectedPercentage: item.selectedPercentage,
      contendedPercentage: item.contendedPercentage,
    }));

    // Call getQuestionsWithStatus and await its result
    const questionsWithStatus = await getQuestionsWithStatus(
      desiredArray,
      uuid
    );
    // getQuestionsWithUserSettings
    const result = await getQuestionsWithUserSettings(questionsWithStatus, uuid);

    res.status(200).json({
      data: result,
      hasNextPage: false,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const searchHiddenQuest = async (req, res) => {
  const searchTerm = req.query.term;
  const uuid = req.cookies.uuid;
  try {
    const results = await UserQuestSetting.find({
      Question: { $regex: searchTerm, $options: "i" },
      uuid: uuid
    });


    const reversedResults = results.reverse();
    const mapPromises = reversedResults.map(async function (record) {
      return await InfoQuestQuestions.findOne({
        _id: record.questForeignKey,
      });
    });

    const allQuestions = await Promise.all(mapPromises);

    const resultArray = allQuestions.map(getPercentage);
    const desiredArray = resultArray.map((item) => ({
      ...item._doc,
      selectedPercentage: item.selectedPercentage,
      contendedPercentage: item.contendedPercentage,
    }));

    // Call getQuestionsWithStatus and await its result
    const questionsWithStatus = await getQuestionsWithStatus(
      desiredArray,
      uuid
    );
    // getQuestionsWithUserSettings
    const result = await getQuestionsWithUserSettings(questionsWithStatus, uuid);

    res.status(200).json({
      data: result,
      hasNextPage: false,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  easySearch,
  searchBookmarks,
  searchHiddenQuest,
};
