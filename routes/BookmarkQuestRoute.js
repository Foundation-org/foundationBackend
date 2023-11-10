const express = require("express");
const router = express.Router();
// controller
const BookmarkQuestController = require("../controller/BookmarkQuestController");
// middleware
const protect = require("../middleware/protect");
const cache = require("../middleware/cache");

router.post("/createBookmarkQuest", BookmarkQuestController.createBookmarkQuest )
router.post("/deleteBookmarkQuest", BookmarkQuestController.deleteBookmarkQuest )
router.post("/getAllBookmarkQuests", BookmarkQuestController.getAllBookmarkQuests )
router.post("/getAllBookmarkQuestions", BookmarkQuestController.getAllBookmarkQuestions )

module.exports = router;