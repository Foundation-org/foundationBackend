const express = require("express");
const router = express.Router();
// controller
const UserSurveyListController = require("../controller/UserSurveyListController");
const isGuest = require("../middleware/isGuest");

/**
 * @swagger
 * tags:
 *   name: UserSurveyList
 *   description: Endpoints for user UserSurveyList
 */

// User's List APIs

router.get(
  "/userList/:userUuid/:categoryName?",
  /**
   * @swagger
   * /userlists/userList/{userUuid}:
   *   get:
   *     tags:
   *       - UserSurveyList
   *     summary: Get user's list information
   *     description: Endpoint to get information of a user
   *     parameters:
   *       - in: path
   *         name: userUuid
   *         required: true
   *         description: The userUuid of the user
   *         schema:
   *           type: string
   *       - in: query
   *         name: categoryName
   *         required: false
   *         description: The categoryName of the user's List
   *         schema:
   *           type: string
   *     responses:
   *       '200':
   *         description: User information retrieved successfully
   *       '500':
   *         description: Internal server error
   */
  UserSurveyListController.userList
);

router.post(
  "/userList/addCategoryInUserList",
  isGuest,
  /**
   * @swagger
   * /userlists/userList/addCategoryInUserList:
   *   post:
   *     tags:
   *       - UserSurveyList
   *     summary: Set bookmark states
   *     description: Endpoint to set bookmark states for a user
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema: 
   *             $ref: '#/components/schemas/BookmarkStatesSetRequest'
   *     responses:
   *       '200':
   *         description: Bookmark states set successfully
   *       '400':
   *         description: Invalid request body
   *       '500':
   *         description: Internal server error
   */
  UserSurveyListController.addCategoryInUserList
);

router.get(
  "/userList/findCategoryById/:userUuid/:categoryId",
  /**
   * @swagger
   * /userlists/userList/findCategoryById/{userUuid}/{categoryId}:
   *   get:
   *     tags:
   *       - UserSurveyList
   *     summary: Get user's list information
   *     description: Endpoint to get information of a user
   *     parameters:
   *       - in: path
   *         name: userUuid
   *         required: true
   *         description: The userUuid of the user
   *       - in: path
   *         name: categoryId
   *         required: true
   *         description: The categoryId of the user's List
   *         schema:
   *           type: string
   *     responses:
   *       '200':
   *         description: User information retrieved successfully
   *       '500':
   *         description: Internal server error
   */
  UserSurveyListController.findCategoryById
);

router.get(
  "/userList/findCategoryByName/:userUuid/:categoryName",
  /**
   * @swagger
   * /userlists/userList/findCategoryByName/{userUuid}/{categoryName}:
   *   get:
   *     tags:
   *       - UserSurveyList
   *     summary: Get user's list information
   *     description: Endpoint to get information of a user
   *     parameters:
   *       - in: path
   *         name: userUuid
   *         required: true
   *         description: The userUuid of the user
   *       - in: path
   *         name: categoryName
   *         required: true
   *         description: The categoryName of the user's List
   *         schema:
   *           type: string
   *     responses:
   *       '200':
   *         description: User information retrieved successfully
   *       '500':
   *         description: Internal server error
   */
  UserSurveyListController.findCategoryByName
);

router.patch(
  "/userList/updateCategoryInUserList/:userUuid/:categoryId/:postId?",
  /**
   * @swagger
   * /userlists/userList/updateCategoryInUserList/{userUuid}/{categoryId}:
   *   patch:
   *     tags:
   *       - UserSurveyList
   *     summary: Update bookmark states
   *     description: Endpoint to update bookmark states for a user
   *     parameters:
   *       - in: path
   *         name: userUuid
   *         required: true
   *         description: The userUuid of the user
   *       - in: path
   *         name: categoryId
   *         required: true
   *         description: The categoryId of the user's List
   *       - in: query
   *         name: postId
   *         required: false
   *         schema:
   *           type: string
   *         description: ID of the post (optional)
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/BookmarkStatesSetRequest'
   *     responses:
   *       '200':
   *         description: Bookmark states updated successfully
   *       '400':
   *         description: Invalid request body
   *       '500':
   *         description: Internal server error
   */
  UserSurveyListController.updateCategoryInUserList
);

router.delete(
  "/userList/deleteCategoryFromList/:userUuid/:categoryId",
  /**
   * @swagger
   * /userlists/userList/deleteCategoryFromList/{userUuid}/{categoryId}:
   *   delete:
   *     tags:
   *       - UserSurveyList
   *     summary: Delete a post from a user's category
   *     description: Endpoint to delete a specific post from a user's category list
   *     parameters:
   *       - in: path
   *         name: userUuid
   *         schema:
   *           type: string
   *         required: true
   *         description: UUID of the user
   *       - in: path
   *         name: categoryId
   *         schema:
   *           type: string
   *         required: true
   *         description: ID of the category
   *     responses:
   *       '200':
   *         description: Post deleted successfully
   *       '404':
   *         description: User, category, or post not found
   *       '500':
   *         description: Internal server error
   */
  UserSurveyListController.deleteCategoryFromList
);

// Generate Link or Customized Link for List.
router.get(
  "/userList/generateCategoryShareLink/:userUuid/:categoryId/:customizedLink?",
  /**
   * @swagger
   * /userlists/userList/generateCategoryShareLink/{userUuid}/{categoryId}:
   *   get:
   *     tags:
   *       - UserSurveyList
   *     summary: Get user's list shared link
   *     description: Endpoint to get shared link of a user
   *     parameters:
   *       - in: path
   *         name: userUuid
   *         required: true
   *         description: The userUuid of the user
   *         schema:
   *           type: string
   *       - in: path
   *         name: categoryId
   *         required: true
   *         description: The categoryId of the user
   *         schema:
   *           type: string
   *       - in: query
   *         name: customizedLink
   *         required: false
   *         description: A String to customized List Sharing link
   *         schema:
   *           type: string
   *     responses:
   *       '200':
   *         description: User shared link retrieved successfully
   *       '500':
   *         description: Internal server error
   */
  UserSurveyListController.generateCategoryShareLink
);

router.get(
  "/findCategoryByLink/:categoryLink/:uuid?",
  /**
   * @swagger
   * /userlists/findCategoryByLink/{categoryLink}:
   *   get:
   *     tags:
   *       - UserSurveyList
   *     summary: Get user's list information
   *     description: Endpoint to get list of a user by link
   *     parameters:
   *       - in: path
   *         name: categoryLink
   *         required: true
   *         description: The categoryLink of the user
   *         schema:
   *           type: string
   *       - in: query
   *         name: uuid
   *         required: false
   *         description: The uuid of the user
   *         schema:
   *           type: string
   *     responses:
   *       '200':
   *         description: User information retrieved successfully
   *       '500':
   *         description: Internal server error
   */
  UserSurveyListController.findCategoryByLink
);

router.get(
  "/viewList/:categoryId/:userUuid",
  /**
   * @swagger
   * /userlists/viewList/{categoryId}/{userUuid}:
   *   get:
   *     tags:
   *       - UserSurveyList
   *     summary: Get user's list information
   *     description: Endpoint to get list of a user by link
   *     parameters:
   *       - in: path
   *         name: categoryId
   *         required: true
   *         description: The categoryId of the user
   *         schema:
   *           type: string
   *       - in: path
   *         name: userUuid
   *         required: true
   *         description: The userUuid of the user
   *         schema:
   *           type: string
   *     responses:
   *       '200':
   *         description: User information retrieved successfully
   *       '500':
   *         description: Internal server error
   */
  UserSurveyListController.viewList
);

router.get(
  "/viewListAll/:categoryId/:userUuid",
  /**
   * @swagger
   * /userlists/viewListAll/{categoryId}/{userUuid}:
   *   get:
   *     tags:
   *       - UserSurveyList
   *     summary: Get user's list information
   *     description: Endpoint to get list of a user by link
   *     parameters:
   *       - in: path
   *         name: categoryId
   *         required: true
   *         description: The categoryId of the user
   *         schema:
   *           type: string
   *       - in: path
   *         name: userUuid
   *         required: true
   *         description: The userUuid of the user
   *         schema:
   *           type: string
   *     responses:
   *       '200':
   *         description: User information retrieved successfully
   *       '500':
   *         description: Internal server error
   */
  UserSurveyListController.viewListAll
);

router.get(
  "/categoryViewCount/:categoryLink",
  /**
   * @swagger
   * /userlists/categoryViewCount/{categoryLink}:
   *   get:
   *     tags:
   *       - UserSurveyList
   *     summary: Get user's list information
   *     description: Endpoint to get list of a user by link
   *     parameters:
   *       - in: path
   *         name: categoryLink
   *         required: true
   *         description: The categoryLink of the user
   *         schema:
   *           type: string
   *     responses:
   *       '200':
   *         description: User information retrieved successfully
   *       '500':
   *         description: Internal server error
   */
  UserSurveyListController.categoryViewCount
);

router.get(
  "/categoryParticipentsCount/:categoryLink",
  /**
   * @swagger
   * /userlists/categoryParticipentsCount/{categoryLink}:
   *   get:
   *     tags:
   *       - UserSurveyList
   *     summary: Get user's list information
   *     description: Endpoint to get list of a user by link
   *     parameters:
   *       - in: path
   *         name: categoryLink
   *         required: true
   *         description: The categoryLink of the user
   *         schema:
   *           type: string
   *     responses:
   *       '200':
   *         description: User information retrieved successfully
   *       '500':
   *         description: Internal server error
   */
  UserSurveyListController.categoryParticipentsCount
);

router.get(
  "/categoryStatistics/:categoryId",
  /**
   * @swagger
   * /userlists/categoryStatistics/{categoryId}:
   *   get:
   *     tags:
   *       - UserSurveyList
   *     summary: Get user's list information
   *     description: Endpoint to get list of a user by link
   *     parameters:
   *       - in: path
   *         name: categoryId
   *         required: true
   *         description: The categoryId of the user
   *         schema:
   *           type: string
   *     responses:
   *       '200':
   *         description: User information retrieved successfully
   *       '500':
   *         description: Internal server error
   */
  UserSurveyListController.categoryStatistics
);

router.post(
  "/userList/updatePostOrder",
  /**
   * @swagger
   * /userlists/userList/updatePostOrder:
   *   post:
   *     tags:
   *       - UserSurveyList
   *     summary: Set bookmark states
   *     description: Endpoint to set bookmark states for a user
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema: 
   *             $ref: '#/components/schemas/BookmarkStatesSetRequest'
   *     responses:
   *       '200':
   *         description: Bookmark states set successfully
   *       '400':
   *         description: Invalid request body
   *       '500':
   *         description: Internal server error
   */
  UserSurveyListController.updatePostOrder
);

router.post(
  "/userList/addPostInCategoryInUserList",
  isGuest,
  /**
   * @swagger
   * /userlists/userList/addPostInCategoryInUserList:
   *   post:
   *     tags:
   *       - UserSurveyList
   *     summary: Set bookmark states
   *     description: Endpoint to set bookmark states for a user
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema: 
   *             $ref: '#/components/schemas/BookmarkStatesSetRequest'
   *     responses:
   *       '200':
   *         description: Bookmark states set successfully
   *       '400':
   *         description: Invalid request body
   *       '500':
   *         description: Internal server error
   */
  UserSurveyListController.addPostInCategoryInUserList
);

router.post(
  "/submitResponse",
  /**
   * @swagger
   * /userlists/submitResponse:
   *   post:
   *     tags:
   *       - UserSurveyList
   *     summary: Submit the response to the Posts belonging to a particular List
   *     description: Endpoint to Submit the response to the Posts belonging to a particular List
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema: 
   *             $ref: '#/components/schemas/BookmarkStatesSetRequest'
   *     responses:
   *       '200':
   *         description: Data saved successfully
   *       '400':
   *         description: Invalid request body
   *       '500':
   *         description: Internal server error
   */
  UserSurveyListController.submitResponse
);

router.post(
  "/changeAnswer",
  /**
   * @swagger
   * /userlists/changeAnswer:
   *   post:
   *     tags:
   *       - UserSurveyList
   *     summary: Submit the response to the Posts belonging to a particular List
   *     description: Endpoint to Submit the response to the Posts belonging to a particular List
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema: 
   *             $ref: '#/components/schemas/BookmarkStatesSetRequest'
   *     responses:
   *       '200':
   *         description: Data saved successfully
   *       '400':
   *         description: Invalid request body
   *       '500':
   *         description: Internal server error
   */
  UserSurveyListController.changeAnswer
);

module.exports = router;
