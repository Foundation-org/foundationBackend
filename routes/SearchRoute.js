const express = require("express");
const router = express.Router();
// controller
const SearchController = require("../controller/SearchController");
// middleware
const protect = require("../middleware/protect");

/**
 * @swagger
 * tags:
 *   name: Search
 *   description: Endpoints for searching various entities
 */

router.post("/easySearch",
  /**
   * @swagger
   * /easySearch:
   *   post:
   *     summary: Easy search
   *     description: Endpoint for easy search functionality
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/SearchInput'
   *     responses:
   *       '200':
   *         description: Successful easy search
   *       '500':
   *         description: Internal server error
   */
  SearchController.easySearch
);

router.post("/searchBookmarks",
  /**
   * @swagger
   * /searchBookmarks:
   *   post:
   *     summary: Search bookmarks
   *     description: Endpoint for searching bookmarks
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/SearchInput'
   *     responses:
   *       '200':
   *         description: Successful search for bookmarks
   *       '500':
   *         description: Internal server error
   */
  SearchController.searchBookmarks
);

router.post("/searchHiddenQuest",
  /**
   * @swagger
   * /searchHiddenQuest:
   *   post:
   *     summary: Search hidden quests
   *     description: Endpoint for searching hidden quests
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/SearchInput'
   *     responses:
   *       '200':
   *         description: Successful search for hidden quests
   *       '500':
   *         description: Internal server error
   */
  SearchController.searchHiddenQuest
);

router.post("/searchCities",
  /**
   * @swagger
   * /searchCities:
   *   post:
   *     summary: Search cities
   *     description: Endpoint for searching cities
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/SearchInput'
   *     responses:
   *       '200':
   *         description: Successful search for cities
   *       '500':
   *         description: Internal server error
   */
  SearchController.searchCities
);

router.post("/searchUniversities",
  /**
   * @swagger
   * /searchUniversities:
   *   post:
   *     summary: Search universities
   *     description: Endpoint for searching universities
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/SearchInput'
   *     responses:
   *       '200':
   *         description: Successful search for universities
   *       '500':
   *         description: Internal server error
   */
  SearchController.searchUniversities
);

router.post("/searchCompanies",
  /**
   * @swagger
   * /searchCompanies:
   *   post:
   *     summary: Search companies
   *     description: Endpoint for searching companies
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/SearchInput'
   *     responses:
   *       '200':
   *         description: Successful search for companies
   *       '500':
   *         description: Internal server error
   */
  SearchController.searchCompanies
);

router.post("/searchJobTitles",
  /**
   * @swagger
   * /searchJobTitles:
   *   post:
   *     summary: Search job titles
   *     description: Endpoint for searching job titles
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/SearchInput'
   *     responses:
   *       '200':
   *         description: Successful search for job titles
   *       '500':
   *         description: Internal server error
   */
  SearchController.searchJobTitles
);

router.post("/searchDegreesAndFields",
  /**
   * @swagger
   * /searchDegreesAndFields:
   *   post:
   *     summary: Search degrees and fields
   *     description: Endpoint for searching degrees and fields
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/SearchInput'
   *     responses:
   *       '200':
   *         description: Successful search for degrees and fields
   *       '500':
   *         description: Internal server error
   */
  SearchController.searchDegreesAndFields
);


module.exports = router;
