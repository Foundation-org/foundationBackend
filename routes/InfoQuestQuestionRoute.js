const express = require("express");
const router = express.Router();
// controller
const InfoQuestQuestionController = require("../controller/InfoQuestQuestionController");
// middleware
const protect = require("../middleware/protect");

/**
 * @swagger
 * tags:
 *   name: Info Quest Question
 *   description: Endpoints for managing info quest questions
 */

router.post("/createInfoQuestQuest",
  /**
   * @swagger
   * /createInfoQuestQuest:
   *   post:
   *     tags:
   *       - Info Quest Question
   *     summary: Create info quest question
   *     description: Endpoint to create a new info quest question
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/InfoQuestQuestionCreationRequest'
   *     responses:
   *       '200':
   *         description: Info quest question created successfully
   *       '500':
   *         description: Internal server error
   */
  InfoQuestQuestionController.createInfoQuestQuest
);

router.get("/constraintForUniqueQuestion",
  /**
   * @swagger
   * /constraintForUniqueQuestion:
   *   get:
   *     tags:
   *       - Info Quest Question
   *     summary: Check constraint for unique question
   *     description: Endpoint to check constraint for unique question
   *     responses:
   *       '200':
   *         description: Constraint check successful
   *       '500':
   *         description: Internal server error
   */
  InfoQuestQuestionController.constraintForUniqueQuestion
);

router.post("/getAllQuests",
  /**
   * @swagger
   * /getAllQuests:
   *   post:
   *     tags:
   *       - Info Quest Question
   *     summary: Get all quests
   *     description: Endpoint to retrieve all info quest questions
   *     responses:
   *       '200':
   *         description: Successfully retrieved all info quest questions
   *       '500':
   *         description: Internal server error
   */
  InfoQuestQuestionController.getAllQuests
);

router.post("/getAllQuestsWithOpenInfoQuestStatus",
  /**
   * @swagger
   * /getAllQuestsWithOpenInfoQuestStatus:
   *   post:
   *     tags:
   *       - Info Quest Question
   *     summary: Get all quests with open info quest status
   *     description: Endpoint to retrieve all info quest questions with open status
   *     responses:
   *       '200':
   *         description: Successfully retrieved all info quest questions with open status
   *       '500':
   *         description: Internal server error
   */
  InfoQuestQuestionController.getAllQuestsWithOpenInfoQuestStatus
);

router.post("/getAllQuestsWithAnsweredStatus",
  /**
   * @swagger
   * /getAllQuestsWithAnsweredStatus:
   *   post:
   *     tags:
   *       - Info Quest Question
   *     summary: Get all quests with answered status
   *     description: Endpoint to retrieve all info quest questions with answered status
   *     responses:
   *       '200':
   *         description: Successfully retrieved all info quest questions with answered status
   *       '500':
   *         description: Internal server error
   */
  InfoQuestQuestionController.getAllQuestsWithAnsweredStatus
);

router.post("/getAllQuestsWithDefaultStatus",
  /**
   * @swagger
   * /getAllQuestsWithDefaultStatus:
   *   post:
   *     tags:
   *       - Info Quest Question
   *     summary: Get all quests with default status
   *     description: Endpoint to retrieve all info quest questions with default status
   *     responses:
   *       '200':
   *         description: Successfully retrieved all info quest questions with default status
   *       '500':
   *         description: Internal server error
   */
  InfoQuestQuestionController.getAllQuestsWithDefaultStatus
);

router.post("/getAllQuestsWithResult",
  /**
   * @swagger
   * /getAllQuestsWithResult:
   *   post:
   *     tags:
   *       - Info Quest Question
   *     summary: Get all quests with result
   *     description: Endpoint to retrieve all info quest questions with result
   *     responses:
   *       '200':
   *         description: Successfully retrieved all info quest questions with result
   *       '500':
   *         description: Internal server error
   */
  InfoQuestQuestionController.getAllQuestsWithResult
);

router.get("/getQuest/:uuid/:id/:page?/:postLink?",
  /**
   * @swagger
   * /getQuest/{uuid}/{id}/{page}/{postLink}:
   *   get:
   *     tags:
   *       - Info Quest Question
   *     summary: Get quest by ID
   *     description: Endpoint to retrieve a specific info quest question by its ID
   *     parameters:
   *       - in: path
   *         name: uuid
   *         required: true
   *         schema:
   *           type: string
   *         description: The UUID of the quest
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: The ID of the quest
   *       - in: path
   *         name: page
   *         required: false
   *         schema:
   *           type: number
   *         description: The page number (optional)
   *       - in: path
   *         name: postLink
   *         required: false
   *         schema:
   *           type: string
   *         description: The post link (optional)
   *     responses:
   *       '200':
   *         description: Successfully retrieved the info quest question
   *       '404':
   *         description: Info quest question not found
   *       '500':
   *         description: Internal server error
   */
  InfoQuestQuestionController.getQuestById
);

router.get("/getQuest/:uniqueShareLink",
  /**
   * @swagger
   * /getQuest/{uniqueShareLink}:
   *   get:
   *     tags:
   *       - Info Quest Question
   *     summary: Get quest by unique share link
   *     description: Endpoint to retrieve a specific info quest question by its unique share link
   *     parameters:
   *       - in: path
   *         name: uniqueShareLink
   *         required: true
   *         schema:
   *           type: string
   *         description: The unique share link of the quest
   *     responses:
   *       '200':
   *         description: Successfully retrieved the info quest question
   *       '404':
   *         description: Info quest question not found
   *       '500':
   *         description: Internal server error
   */
  InfoQuestQuestionController.getQuestByUniqueShareLink
);

router.post("/getAllQuestsWithCompletedStatus",
  /**
   * @swagger
   * /getAllQuestsWithCompletedStatus:
   *   post:
   *     tags:
   *       - Info Quest Question
   *     summary: Get all quests with completed status
   *     description: Endpoint to retrieve all info quest questions with completed status
   *     responses:
   *       '200':
   *         description: Successfully retrieved all info quest questions with completed status
   *       '500':
   *         description: Internal server error
   */
  InfoQuestQuestionController.getAllQuestsWithCompletedStatus
);

router.post("/getAllQuestsWithChangeAnsStatus",
  /**
   * @swagger
   * /getAllQuestsWithChangeAnsStatus:
   *   post:
   *     tags:
   *       - Info Quest Question
   *     summary: Get all quests with change answer status
   *     description: Endpoint to retrieve all info quest questions with change answer status
   *     responses:
   *       '200':
   *         description: Successfully retrieved all info quest questions with change answer status
   *       '500':
   *         description: Internal server error
   */
  InfoQuestQuestionController.getAllQuestsWithChangeAnsStatus
);

router.get("/checkMediaDuplicateUrl/:id",
  /**
   * @swagger
   * /checkMediaDuplicateUrl/{id}:
   *   get:
   *     tags:
   *       - Info Quest Question
   *     summary: Check media duplicate URL
   *     description: Endpoint to check if the media URL is duplicate
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: The ID of the media
   *     responses:
   *       '200':
   *         description: Media URL is not duplicate
   *       '409':
   *         description: Media URL is duplicate
   *       '500':
   *         description: Internal server error
   */
  InfoQuestQuestionController.checkMediaDuplicateUrl
);

router.get("/getFullSoundcloudUrlFromShortUrl",
  /**
   * @swagger
   * /getFullSoundcloudUrlFromShortUrl:
   *   get:
   *     tags:
   *       - Info Quest Question
   *     summary: Get full Soundcloud URL from short URL
   *     description: Endpoint to retrieve full Soundcloud URL from short URL
   *     responses:
   *       '200':
   *         description: Full Soundcloud URL retrieved successfully
   *       '500':
   *         description: Internal server error
   */
  InfoQuestQuestionController.getFullSoundcloudUrlFromShortUrl
);

router.get("/getFlickerUrl",
  /**
   * @swagger
   * /getFlickerUrl:
   *   get:
   *     tags:
   *       - Info Quest Question
   *     summary: Get Flicker URL
   *     description: Endpoint to retrieve Flicker URL
   *     responses:
   *       '200':
   *         description: Flicker URL retrieved successfully
   *       '500':
   *         description: Internal server error
   */
  InfoQuestQuestionController.getFlickerUrl
);

module.exports = router;
