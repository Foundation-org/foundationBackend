const InfoQuestQuestions = require("../models/InfoQuestQuestions");
const BookmarkQuests = require("../models/BookmarkQuests");

const easySearch = async (req, res) => {
    const searchTerm = req.query.term;
  
    try {
      const results = await InfoQuestQuestions.find({
        $or: [
          { Question: { $regex: searchTerm, $options: "i" } },
          { whichTypeQuestion: { $regex: searchTerm, $options: "i" } },
          {
            "QuestAnswers.question": { $regex: searchTerm, $options: "i" },
          },
        ],
      });
  
      const reversedResults = results.reverse();
  
      res.status(200).json(reversedResults);
    } catch (err) {
      res.status(500).send("Internal Server Error");
    }
  }
const searchBookmarks = async (req, res) => {
    const searchTerm = req.query.term;
    try {
      const results = await BookmarkQuests.find({
        $or: [{ Question: { $regex: searchTerm, $options: "i" } }],
      });
      const reversedResults = results.reverse();
      res.status(200).json(reversedResults);
    } catch (err) {
      res.status(500).send("Internal Server Error");
    }
  }

module.exports = {
    easySearch,
    searchBookmarks,
}