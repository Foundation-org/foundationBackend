const express = require("express");
const router = express.Router();
// controller
const QuestTopicController = require("../controller/QuestTopicController");
// middleware
const protect = require("../middleware/protect");

router.patch("/topic/:topicId/:isAllow", QuestTopicController.update);

router.get("/getAllTopic", QuestTopicController.getAllTopic);

router.get("/searchTopics", QuestTopicController.searchTopics);

router.get("/getAllQuestByTopic", QuestTopicController.getAllQuestByTopic);

router.get(
  "/getAllQuestByTrendingTopic",
  QuestTopicController.getAllQuestByTrendingTopic
);

module.exports = router;
