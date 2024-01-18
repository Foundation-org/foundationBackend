const express = require("express");
const router = express.Router();
// controller
const InfoQuestQuestionController = require("../controller/InfoQuestQuestionController");
// middleware
const protect = require("../middleware/protect");

router.post(
  "/createInfoQuestQuest",
  InfoQuestQuestionController.createInfoQuestQuest
);
router.get(
  "/constraintForUniqueQuestion",
  InfoQuestQuestionController.constraintForUniqueQuestion
);
router.post("/getAllQuests", InfoQuestQuestionController.getAllQuests);
router.post(
  "/getAllQuestsWithOpenInfoQuestStatus",
  InfoQuestQuestionController.getAllQuestsWithOpenInfoQuestStatus
);
router.post(
  "/getAllQuestsWithAnsweredStatus",
  InfoQuestQuestionController.getAllQuestsWithAnsweredStatus
);
router.post(
  "/getAllQuestsWithDefaultStatus",
  InfoQuestQuestionController.getAllQuestsWithDefaultStatus
);
router.post(
  "/getAllQuestsWithResult",
  InfoQuestQuestionController.getAllQuestsWithResult
);
router.get("/getQuest/:uuid/:id", InfoQuestQuestionController.getQuestById);
router.post(
  "/getAllQuestsWithCompletedStatus",
  InfoQuestQuestionController.getAllQuestsWithCompletedStatus
);
router.post(
  "/getAllQuestsWithChangeAnsStatus",
  InfoQuestQuestionController.getAllQuestsWithChangeAnsStatus
);

module.exports = router;
