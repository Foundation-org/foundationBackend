const route = require("express").Router();

const BookmarkQuests = require("../models/BookmarkQuests");
const InfoQuestQuestions = require("../models/InfoQuestQuestions");

// SIGN UP
route.post("/createBookmarkQuest", async (req, res) => {
  try {
    const question = await new BookmarkQuests({
      Question: req.body.Question,
      questForeignKey: req.body.questForeignKey,
      uuid: req.body.uuid,
    });

    const questions = await question.save();
    !questions && res.status(404).send("Not Created 1");

    res.status(201).send("Quest has been Created");
  } catch (err) {
    res.status(500).send("Not Created 2");
  }
});

route.post("/deleteBookmarkQuest", async (req, res) => {
  try {
    await BookmarkQuests.deleteOne({
      questForeignKey: req.body.questForeignKey,
      uuid: req.body.uuid,
    });

    res.status(201).send("Quest has been deleted");
  } catch (err) {
    res.status(500).send("Not Deleted 2");
  }
});

// Get all Bookmarkes of user have
route.post("/getAllBookmarkQuests", async (req, res) => {
  try {
    const Questions = await BookmarkQuests.find({
      uuid: req.body.uuid,
    });
    // console.log(Questions);
    res.status(200).json(Questions);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Get all Bookmarked questions of user have
route.post("/getAllBookmarkQuestions", async (req, res) => {
  try {
    const { uuid, _page, _limit } = req.body;
    const page = parseInt(_page) 
    const pageSize = parseInt(_limit); 
  
    // Calculate the number of documents to skip to get to the desired page
    const skip = (page - 1) * pageSize;


    const Questions = await BookmarkQuests.find({
      uuid:uuid,
    }).sort({ createdAt: -1 }) // Sort by createdAt field in descending order
    .skip(skip)
    .limit(pageSize);

    let response = [];
    const mapReq = await Questions.map(async function (record) {

      let rec = await InfoQuestQuestions.findOne({
        _id: record.questForeignKey,
      });

      response = [...response, rec];
    });

    return Promise.all(mapReq).then(() => {
      res.status(200).json(response);
    });
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = route;
