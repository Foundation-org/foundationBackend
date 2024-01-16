const express = require("express");
const router = express.Router();
// controller
const StartQuestController = require("../controller/StartQuestController");
// middleware
const protect = require("../middleware/protect");

router.post(
  "/updateViolationCounter",
  StartQuestController.updateViolationCounter
);
router.post("/createStartQuest", StartQuestController.createStartQuest);
router.post(
  "/updateChangeAnsStartQuest",
  StartQuestController.updateChangeAnsStartQuest
);
router.post(
  "/getRankedQuestPercent",
  StartQuestController.getRankedQuestPercent
);
router.post("/getStartQuestPercent", StartQuestController.getStartQuestPercent);
router.post("/getStartQuestInfo", StartQuestController.getStartQuestInfo);

module.exports = router;
