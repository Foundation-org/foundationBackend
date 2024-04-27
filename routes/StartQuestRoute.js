const express = require("express");
const router = express.Router();
// controller
const StartQuestController = require("../controller/StartQuestController");
// middleware
const protect = require("../middleware/protect");

/**
 * @swagger
 * tags:
 *   name: Start Quest
 *   description: Endpoints for starting and managing quests
 */

router.post("/updateViolationCounter",
  /**
   * @swagger
   * /updateViolationCounter:
   *   post:
   *     summary: Update violation counter
   *     description: Endpoint to update violation counter for a quest
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/ViolationCounterUpdateRequest'
   *     responses:
   *       '200':
   *         description: Violation counter updated successfully
   *       '500':
   *         description: Internal server error
   */
  StartQuestController.updateViolationCounter
);

router.post("/createStartQuest",
  /**
   * @swagger
   * /createStartQuest:
   *   post:
   *     summary: Create start quest
   *     description: Endpoint to create a start quest
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/StartQuestCreationRequest'
   *     responses:
   *       '200':
   *         description: Start quest created successfully
   *       '500':
   *         description: Internal server error
   */
  StartQuestController.createStartQuest
);

router.post("/updateChangeAnsStartQuest",
  /**
   * @swagger
   * /updateChangeAnsStartQuest:
   *   post:
   *     summary: Update change answer start quest
   *     description: Endpoint to update change answer start quest
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/ChangeAnswerStartQuestRequest'
   *     responses:
   *       '200':
   *         description: Change answer start quest updated successfully
   *       '500':
   *         description: Internal server error
   */
  StartQuestController.updateChangeAnsStartQuest
);

router.post("/getRankedQuestPercent",
  /**
   * @swagger
   * /getRankedQuestPercent:
   *   post:
   *     summary: Get ranked quest percentage
   *     description: Endpoint to get the percentage of ranked quests
   *     responses:
   *       '200':
   *         description: Successfully retrieved ranked quest percentage
   *       '500':
   *         description: Internal server error
   */
  StartQuestController.getRankedQuestPercent
);

router.post("/getStartQuestPercent",
  /**
   * @swagger
   * /getStartQuestPercent:
   *   post:
   *     summary: Get start quest percentage
   *     description: Endpoint to get the percentage of start quests
   *     responses:
   *       '200':
   *         description: Successfully retrieved start quest percentage
   *       '500':
   *         description: Internal server error
   */
  StartQuestController.getStartQuestPercent
);

router.post("/getStartQuestInfo",
  /**
   * @swagger
   * /getStartQuestInfo:
   *   post:
   *     summary: Get start quest information
   *     description: Endpoint to get information about a start quest
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/StartQuestInfoRequest'
   *     responses:
   *       '200':
   *         description: Successfully retrieved start quest information
   *       '500':
   *         description: Internal server error
   */
  StartQuestController.getStartQuestInfo
);

module.exports = router;
