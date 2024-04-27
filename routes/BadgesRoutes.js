const express = require("express");
const router = express.Router();
// controller
const BadgeController = require("../controller/BadgeController");
// middleware
const protect = require("../middleware/protect");
const socialProtect = require("../middleware/socialProtect");

/**
 * @swagger
 * tags:
 *   name: Badge
 *   description: Endpoints for managing user badges
 */

router.patch("/updateBadge/:userId/:badgeId",
  /**
   * @swagger
   * /updateBadge/{userId}/{badgeId}:
   *   patch:
   *     summary: Update user badge
   *     description: Endpoint to update a user badge
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: string
   *         description: The ID of the user
   *       - in: path
   *         name: badgeId
   *         required: true
   *         schema:
   *           type: string
   *         description: The ID of the badge
   *     responses:
   *       '200':
   *         description: User badge updated successfully
   *       '404':
   *         description: User or badge not found
   *       '500':
   *         description: Internal server error
   */
  BadgeController.update
);

router.get("/getBadges/:userId",
  /**
   * @swagger
   * /getBadges/{userId}:
   *   get:
   *     summary: Get user badges
   *     description: Endpoint to retrieve badges of a user
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: string
   *         description: The ID of the user
   *     responses:
   *       '200':
   *         description: Successfully retrieved user badges
   *       '404':
   *         description: User not found
   *       '500':
   *         description: Internal server error
   */
  BadgeController.getBadges
);

router.post("/addBadge/social", socialProtect,
  /**
   * @swagger
   * /addBadge/social:
   *   post:
   *     summary: Add social badge
   *     description: Endpoint to add a social badge for a user
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/SocialBadgeRequest'
   *     responses:
   *       '200':
   *         description: Social badge added successfully
   *       '500':
   *         description: Internal server error
   */
  BadgeController.addBadgeSocial
);

router.post("/addBadge/contact",
  /**
   * @swagger
   * /addBadge/contact:
   *   post:
   *     summary: Add contact badge
   *     description: Endpoint to add a contact badge for a user
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/ContactBadgeRequest'
   *     responses:
   *       '200':
   *         description: Contact badge added successfully
   *       '500':
   *         description: Internal server error
   */
  BadgeController.addContactBadge
);

router.post("/addBadge/contact/verify",
  /**
   * @swagger
   * /addBadge/contact/verify:
   *   post:
   *     summary: Verify contact badge
   *     description: Endpoint to verify a contact badge for a user
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/ContactBadgeVerificationRequest'
   *     responses:
   *       '200':
   *         description: Contact badge verified successfully
   *       '500':
   *         description: Internal server error
   */
  BadgeController.addContactBadgeVerify
);

router.post("/addBadge/contact/add",
  /**
   * @swagger
   * /addBadge/contact/add:
   *   post:
   *     summary: Add contact badge (additional)
   *     description: Endpoint to add an additional contact badge for a user
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/AdditionalContactBadgeRequest'
   *     responses:
   *       '200':
   *         description: Additional contact badge added successfully
   *       '500':
   *         description: Internal server error
   */
  BadgeController.addContactBadgeAdd
);

router.post("/addBadge",
  /**
   * @swagger
   * /addBadge:
   *   post:
   *     summary: Add badge
   *     description: Endpoint to add a badge for a user
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/BadgeRequest'
   *     responses:
   *       '200':
   *         description: Badge added successfully
   *       '500':
   *         description: Internal server error
   */
  BadgeController.addBadge
);

router.post("/addBadge/personal/add",
  /**
   * @swagger
   * /addBadge/personal/add:
   *   post:
   *     summary: Add personal badge (additional)
   *     description: Endpoint to add an additional personal badge for a user
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/AdditionalPersonalBadgeRequest'
   *     responses:
   *       '200':
   *         description: Additional personal badge added successfully
   *       '500':
   *         description: Internal server error
   */
  BadgeController.addPersonalBadge
);

router.post("/addBadge/personal/addWorkOrEducation",
  /**
   * @swagger
   * /addBadge/personal/addWorkOrEducation:
   *   post:
   *     summary: Add work or education badge
   *     description: Endpoint to add a work or education badge for a user
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/WorkEducationBadgeRequest'
   *     responses:
   *       '200':
   *         description: Work or education badge added successfully
   *       '500':
   *         description: Internal server error
   */
  BadgeController.addWorkEducationBadge
);

router.post("/addBadge/personal/deleteWorkOrEducation",
  /**
   * @swagger
   * /addBadge/personal/deleteWorkOrEducation:
   *   post:
   *     summary: Remove a work or education badge
   *     description: Endpoint to remove a work or education badge for a user
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/WorkEducationBadgeDeleteRequest'
   *     responses:
   *       '200':
   *         description: Work or education badge removed successfully
   *       '500':
   *         description: Internal server error
   */
  BadgeController.removeAWorkEducationBadge
);

router.post("/addBadge/personal/getWorkOrEducation",
  /**
   * @swagger
   * /addBadge/personal/getWorkOrEducation:
   *   post:
   *     summary: Get a work or education badge
   *     description: Endpoint to retrieve a work or education badge for a user
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/WorkEducationBadgeGetRequest'
   *     responses:
   *       '200':
   *         description: Work or education badge retrieved successfully
   *       '404':
   *         description: Work or education badge not found
   *       '500':
   *         description: Internal server error
   */
  BadgeController.getAWorkAndEducationBadge
);

router.post("/addBadge/personal/updateWorkOrEducation",
  /**
   * @swagger
   * /addBadge/personal/updateWorkOrEducation:
   *   post:
   *     summary: Update a work or education badge
   *     description: Endpoint to update a work or education badge for a user
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/WorkEducationBadgeUpdateRequest'
   *     responses:
   *       '200':
   *         description: Work or education badge updated successfully
   *       '500':
   *         description: Internal server error
   */
  BadgeController.updateWorkAndEducationBadge
);

router.post("/addBadge/personal/getPersonalBadge",
  /**
   * @swagger
   * /addBadge/personal/getPersonalBadge:
   *   post:
   *     summary: Get personal badge
   *     description: Endpoint to retrieve a personal badge for a user
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/PersonalBadgeGetRequest'
   *     responses:
   *       '200':
   *         description: Personal badge retrieved successfully
   *       '404':
   *         description: Personal badge not found
   *       '500':
   *         description: Internal server error
   */
  BadgeController.getPersonalBadge
);

router.post("/addBadge/personal/updatePersonalBadge",
  /**
   * @swagger
   * /addBadge/personal/updatePersonalBadge:
   *   post:
   *     summary: Update personal badge
   *     description: Endpoint to update a personal badge for a user
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/PersonalBadgeUpdateRequest'
   *     responses:
   *       '200':
   *         description: Personal badge updated successfully
   *       '500':
   *         description: Internal server error
   */
  BadgeController.updatePersonalBadge
);

router.post("/addBadge/company/add",
  /**
   * @swagger
   * /addBadge/company/add:
   *   post:
   *     summary: Add company badge
   *     description: Endpoint to add a company badge
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CompanyBadgeRequest'
   *     responses:
   *       '200':
   *         description: Company badge added successfully
   *       '500':
   *         description: Internal server error
   */
  BadgeController.addCompany
);

router.post("/addBadge/jobTitles/add",
  /**
   * @swagger
   * /addBadge/jobTitles/add:
   *   post:
   *     summary: Add job title badge
   *     description: Endpoint to add a job title badge
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/JobTitleBadgeRequest'
   *     responses:
   *       '200':
   *         description: Job title badge added successfully
   *       '500':
   *         description: Internal server error
   */
  BadgeController.addJobTitle
);

router.post("/addBadge/degreesAndFields/add",
  /**
   * @swagger
   * /addBadge/degreesAndFields/add:
   *   post:
   *     summary: Add degrees and fields badge
   *     description: Endpoint to add a degrees and fields badge
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/DegreesAndFieldsBadgeRequest'
   *     responses:
   *       '200':
   *         description: Degrees and fields badge added successfully
   *       '500':
   *         description: Internal server error
   */
  BadgeController.addDegreesAndFields
);

router.post("/removeBadge",
  /**
   * @swagger
   * /removeBadge:
   *   post:
   *     summary: Remove badge
   *     description: Endpoint to remove a badge for a user
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/BadgeRemovalRequest'
   *     responses:
   *       '200':
   *         description: Badge removed successfully
   *       '500':
   *         description: Internal server error
   */
  BadgeController.removeBadge
);

router.post("/removeContactBadge",
  /**
   * @swagger
   * /removeContactBadge:
   *   post:
   *     summary: Remove contact badge
   *     description: Endpoint to remove a contact badge for a user
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/ContactBadgeRemovalRequest'
   *     responses:
   *       '200':
   *         description: Contact badge removed successfully
   *       '500':
   *         description: Internal server error
   */
  BadgeController.removeContactBadge
);

router.post("/removePersonalBadge",
  /**
   * @swagger
   * /removePersonalBadge:
   *   post:
   *     summary: Remove personal badge
   *     description: Endpoint to remove a personal badge for a user
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/PersonalBadgeRemovalRequest'
   *     responses:
   *       '200':
   *         description: Personal badge removed successfully
   *       '500':
   *         description: Internal server error
   */
  BadgeController.removePersonalBadge
);

router.post("/removeWeb3Badge",
  /**
   * @swagger
   * /removeWeb3Badge:
   *   post:
   *     summary: Remove web3 badge
   *     description: Endpoint to remove a web3 badge for a user
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/Web3BadgeRemovalRequest'
   *     responses:
   *       '200':
   *         description: Web3 badge removed successfully
   *       '500':
   *         description: Internal server error
   */
  BadgeController.removeWeb3Badge
);

router.post("/addBadge/web3/add",
  /**
   * @swagger
   * /addBadge/web3/add:
   *   post:
   *     summary: Add web3 badge
   *     description: Endpoint to add a web3 badge for a user
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/Web3BadgeAddRequest'
   *     responses:
   *       '200':
   *         description: Web3 badge added successfully
   *       '500':
   *         description: Internal server error
   */
  BadgeController.addWeb3Badge
);

router.post("/addBadge/passkey/add",
  /**
   * @swagger
   * /addBadge/passkey/add:
   *   post:
   *     summary: Add passkey badge
   *     description: Endpoint to add a passkey badge for a user
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/PasskeyBadgeAddRequest'
   *     responses:
   *       '200':
   *         description: Passkey badge added successfully
   *       '500':
   *         description: Internal server error
   */
  BadgeController.addPasskeyBadge
);

router.post("/addBadge/addFarCasterBadge/add",
  /**
   * @swagger
   * /addBadge/addFarCasterBadge/add:
   *   post:
   *     summary: Add FarCaster badge
   *     description: Endpoint to add a FarCaster badge for a user
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/FarCasterBadgeAddRequest'
   *     responses:
   *       '200':
   *         description: FarCaster badge added successfully
   *       '500':
   *         description: Internal server error
   */
  BadgeController.addFarCasterBadge
);

router.post("/removePasskey",
  /**
   * @swagger
   * /removePasskey:
   *   post:
   *     summary: Remove passkey badge
   *     description: Endpoint to remove a passkey badge for a user
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/PasskeyBadgeRemovalRequest'
   *     responses:
   *       '200':
   *         description: Passkey badge removed successfully
   *       '500':
   *         description: Internal server error
   */
  BadgeController.removePasskeyBadge
);

router.post("/removeFarCasterBadge",
  /**
   * @swagger
   * /removeFarCasterBadge:
   *   post:
   *     summary: Remove FarCaster badge
   *     description: Endpoint to remove a FarCaster badge for a user
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/FarCasterBadgeRemovalRequest'
   *     responses:
   *       '200':
   *         description: FarCaster badge removed successfully
   *       '500':
   *         description: Internal server error
   */
  BadgeController.removeFarCasterBadge
);

module.exports = router;
