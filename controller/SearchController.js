const InfoQuestQuestions = require("../models/InfoQuestQuestions");
const BookmarkQuests = require("../models/BookmarkQuests");
const { getQuestionsWithStatus } = require("./InfoQuestQuestionController");
const { getPercentage } = require("../utils/getPercentage");

const easySearch = async (req, res) => {
  const searchTerm = req.query.term || "";
  const uuid = req.cookies.uuid;

  try {
    const results = await InfoQuestQuestions.find({
      $or: [
        { Question: { $regex: searchTerm, $options: "i" } },
        { whichTypeQuestion: { $regex: searchTerm, $options: "i" } },
        { "QuestAnswers.question": { $regex: searchTerm, $options: "i" } },
      ],
    });

    const resultArray = results.map(getPercentage);
    const desiredArray = resultArray.map((item) => ({
      ...item._doc,
      selectedPercentage: item.selectedPercentage,
      contendedPercentage: item.contendedPercentage,
    }));
  
    // Query the database with skip and limit options to get questions for the requested page
    const result = await getQuestionsWithStatus(desiredArray, uuid);


    // const questionsWithStatus = await getQuestionsWithStatus(results, uuid);

    res.status(200).json({
      data: result,
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
    const results = await BookmarkQuests.find({
      $or: [{ Question: { $regex: searchTerm, $options: "i" } }],
    });
    const reversedResults = results.reverse();
    const mapPromises = reversedResults.map(async function (record) {
      return await InfoQuestQuestions.findOne({
        _id: record.questForeignKey,
      });
    });

    const allQuestions = await Promise.all(mapPromises);

    // Call getQuestionsWithStatus and await its result
    const questionsWithStatus = await getQuestionsWithStatus(
      allQuestions,
      uuid
    );

    res.status(200).json({
      data: questionsWithStatus,
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
};
