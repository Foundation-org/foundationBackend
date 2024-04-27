const express = require("express");
const router = express.Router();
// controller
const DirectMessageController = require("../controller/DirectMessageController");
// middleware
const protect = require("../middleware/protect");

/**
 * @swagger
 * tags:
 *   name: Direct Message
 *   description: Endpoints for managing direct messages
 */

router.post("/directMessage/send",
  /**
   * @swagger
   * /directMessage/send:
   *   post:
   *     summary: Send direct message
   *     description: Endpoint to send a direct message
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/DirectMessageSendRequest'
   *     responses:
   *       '200':
   *         description: Direct message sent successfully
   *       '500':
   *         description: Internal server error
   */
  DirectMessageController.send
);

router.post("/directMessage/draft",
  /**
   * @swagger
   * /directMessage/draft:
   *   post:
   *     summary: Save draft direct message
   *     description: Endpoint to save a draft direct message
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/DirectMessageDraftRequest'
   *     responses:
   *       '200':
   *         description: Draft direct message saved successfully
   *       '500':
   *         description: Internal server error
   */
  DirectMessageController.draft
);

router.get("/directMessage/getAllDraft/:uuid",
  /**
   * @swagger
   * /directMessage/getAllDraft/{uuid}:
   *   get:
   *     summary: Get all draft messages
   *     description: Endpoint to retrieve all draft direct messages by user UUID
   *     parameters:
   *       - in: path
   *         name: uuid
   *         required: true
   *         schema:
   *           type: string
   *         description: The UUID of the user
   *     responses:
   *       '200':
   *         description: Successfully retrieved all draft direct messages
   *       '500':
   *         description: Internal server error
   */
  DirectMessageController.getAllDraft
);

router.get("/directMessage/getAllSend/:uuid",
  /**
   * @swagger
   * /directMessage/getAllSend/{uuid}:
   *   get:
   *     summary: Get all sent messages
   *     description: Endpoint to retrieve all sent direct messages by user UUID
   *     parameters:
   *       - in: path
   *         name: uuid
   *         required: true
   *         schema:
   *           type: string
   *         description: The UUID of the user
   *     responses:
   *       '200':
   *         description: Successfully retrieved all sent direct messages
   *       '500':
   *         description: Internal server error
   */
  DirectMessageController.getAllSend
);

router.get("/directMessage/getAllReceive/:uuid",
  /**
   * @swagger
   * /directMessage/getAllReceive/{uuid}:
   *   get:
   *     summary: Get all received messages
   *     description: Endpoint to retrieve all received direct messages by user UUID
   *     parameters:
   *       - in: path
   *         name: uuid
   *         required: true
   *         schema:
   *           type: string
   *         description: The UUID of the user
   *     responses:
   *       '200':
   *         description: Successfully retrieved all received direct messages
   *       '500':
   *         description: Internal server error
   */
  DirectMessageController.getAllReceive
);

router.post("/directMessage/view",
  /**
   * @swagger
   * /directMessage/view:
   *   post:
   *     summary: View direct message
   *     description: Endpoint to mark a direct message as viewed
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/DirectMessageViewRequest'
   *     responses:
   *       '200':
   *         description: Direct message viewed successfully
   *       '500':
   *         description: Internal server error
   */
  DirectMessageController.view
);

router.delete("/directMessage/delete",
  /**
   * @swagger
   * /directMessage/delete:
   *   delete:
   *     summary: Delete direct message
   *     description: Endpoint to delete a direct message
   *     responses:
   *       '200':
   *         description: Direct message deleted successfully
   *       '500':
   *         description: Internal server error
   */
  DirectMessageController.deleteMessage
);

router.post("/directMessage/trash",
  /**
   * @swagger
   * /directMessage/trash:
   *   post:
   *     summary: Move direct message to trash
   *     description: Endpoint to move a direct message to trash
   *     responses:
   *       '200':
   *         description: Direct message moved to trash successfully
   *       '500':
   *         description: Internal server error
   */
  DirectMessageController.trashMessage
);

router.post("/directMessage/restore",
  /**
   * @swagger
   * /directMessage/restore:
   *   post:
   *     summary: Restore direct message from trash
   *     description: Endpoint to restore a direct message from trash
   *     responses:
   *       '200':
   *         description: Direct message restored from trash successfully
   *       '500':
   *         description: Internal server error
   */
  DirectMessageController.restoreMessage
);

router.get("/directMessage/getAllDeletedMessage/:uuid",
  /**
   * @swagger
   * /directMessage/getAllDeletedMessage/{uuid}:
   *   get:
   *     summary: Get all deleted messages
   *     description: Endpoint to retrieve all deleted messages for a user
   *     parameters:
   *       - in: path
   *         name: uuid
   *         required: true
   *         schema:
   *           type: string
   *         description: The UUID of the user
   *     responses:
   *       '200':
   *         description: Successfully retrieved all deleted messages
   *       '404':
   *         description: No deleted messages found
   *       '500':
   *         description: Internal server error
   */
  DirectMessageController.getAllDeletedMessage
);


module.exports = router;
