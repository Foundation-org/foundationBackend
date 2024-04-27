const express = require("express");
const router = express.Router();
// controller
const BookmarkQuestController = require("../controller/BookmarkQuestController");
// middleware
const protect = require("../middleware/protect");
const cache = require("../middleware/cache");

/**
 * @swagger
 * tags:
 *   name: Bookmark Quest
 *   description: Endpoints for bookmarking quests and questions
 */

router.post("/createBookmarkQuest",
  /**
   * @swagger
   * /createBookmarkQuest:
   *   post:
   *     summary: Create a bookmark for a quest
   *     description: Endpoint to create a bookmark for a quest
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/BookmarkQuestInput'
   *     responses:
   *       '200':
   *         description: Bookmark created successfully
   *       '500':
   *         description: Internal server error
   */
  BookmarkQuestController.createBookmarkQuest
);

router.post("/deleteBookmarkQuest",
  /**
   * @swagger
   * /deleteBookmarkQuest:
   *   post:
   *     summary: Delete a bookmark for a quest
   *     description: Endpoint to delete a bookmark for a quest
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/BookmarkQuestInput'
   *     responses:
   *       '200':
   *         description: Bookmark deleted successfully
   *       '500':
   *         description: Internal server error
   */
  BookmarkQuestController.deleteBookmarkQuest
);

router.post("/getAllBookmarkQuests",
  /**
   * @swagger
   * /getAllBookmarkQuests:
   *   post:
   *     summary: Get all bookmarked quests
   *     description: Endpoint to get all bookmarked quests
   *     responses:
   *       '200':
   *         description: Successfully retrieved all bookmarked quests
   *       '500':
   *         description: Internal server error
   */
  BookmarkQuestController.getAllBookmarkQuests
);

router.post("/getAllBookmarkQuestions",
  /**
   * @swagger
   * /getAllBookmarkQuestions:
   *   post:
   *     summary: Get all bookmarked questions
   *     description: Endpoint to get all bookmarked questions
   *     responses:
   *       '200':
   *         description: Successfully retrieved all bookmarked questions
   *       '500':
   *         description: Internal server error
   */
  BookmarkQuestController.getAllBookmarkQuestions
);



module.exports = router;
