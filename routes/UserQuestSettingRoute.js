const express = require("express");
const router = express.Router();
// controller
const UserQuestSettingController = require("../controller/UserQuestSettingController");
// middleware
const protect = require("../middleware/protect");
const socialProtect = require("../middleware/socialProtect");

/**
 * @swagger
 * tags:
 *   name: User Quest Setting
 *   description: Endpoints for managing user quest settings
 */

router.post(
  "/userQuestSetting/createOrUpdate",
  /**
   * @swagger
   * /userQuestSetting/createOrUpdate:
   *   post:
   *     tags:
   *       - User Quest Setting
   *     summary: Create or update user quest setting
   *     description: Endpoint to create or update user quest setting
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UserQuestSettingCreateOrUpdateRequest'
   *     responses:
   *       '200':
   *         description: User quest setting created or updated successfully
   *       '500':
   *         description: Internal server error
   */
  UserQuestSettingController.createOrUpdate
);

router.post(
  "/userQuestSetting/create",
  /**
   * @swagger
   * /userQuestSetting/create:
   *   post:
   *     tags:
   *       - User Quest Setting
   *     summary: Create user quest setting
   *     description: Endpoint to create user quest setting
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UserQuestSettingCreateRequest'
   *     responses:
   *       '200':
   *         description: User quest setting created successfully
   *       '500':
   *         description: Internal server error
   */
  UserQuestSettingController.create
);

router.post(
  "/userQuestSetting/update",
  /**
   * @swagger
   * /userQuestSetting/update:
   *   post:
   *     tags:
   *       - User Quest Setting
   *     summary: Update user quest setting
   *     description: Endpoint to update user quest setting
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UserQuestSettingUpdateRequest'
   *     responses:
   *       '200':
   *         description: User quest setting updated successfully
   *       '500':
   *         description: Internal server error
   */
  UserQuestSettingController.update
);

router.post(
  "/userQuestSetting/link",
  /**
   * @swagger
   * /userQuestSetting/link:
   *   post:
   *     tags:
   *       - User Quest Setting
   *     summary: Link user quest setting
   *     description: Endpoint to link user quest setting
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UserQuestSettingLinkRequest'
   *     responses:
   *       '200':
   *         description: User quest setting linked successfully
   *       '500':
   *         description: Internal server error
   */
  UserQuestSettingController.link
);

router.post(
  "/userQuestImpression/:link",
  /**
   * @swagger
   * /userQuestImpression/{link}:
   *   post:
   *     tags:
   *       - User Quest Setting
   *     summary: Record user quest impression
   *     description: Endpoint to record user quest impression
   *     parameters:
   *       - in: path
   *         name: link
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       '200':
   *         description: User quest impression recorded successfully
   *       '500':
   *         description: Internal server error
   */
  UserQuestSettingController.impression
);

router.post(
  "/linkStatus/:link",
  /**
   * @swagger
   * /linkStatus/{link}:
   *   post:
   *     tags:
   *       - User Quest Setting
   *     summary: Get link status
   *     description: Endpoint to get link status
   *     parameters:
   *       - in: path
   *         name: link
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       '200':
   *         description: Link status retrieved successfully
   *       '500':
   *         description: Internal server error
   */
  UserQuestSettingController.status
);

module.exports = router;
