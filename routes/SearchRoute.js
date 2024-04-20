const express = require("express");
const router = express.Router();
// controller
const SearchController = require("../controller/SearchController");
// middleware
const protect = require("../middleware/protect");

router.post("/easySearch", SearchController.easySearch);
router.post("/searchBookmarks", SearchController.searchBookmarks);
router.post("/searchHiddenQuest", SearchController.searchHiddenQuest);
router.post("/searchCities", SearchController.searchCities);
router.post("/searchUniversities", SearchController.searchUniversities);
router.post("/searchCompanies", SearchController.searchCompanies);
router.post("/searchJobTitles", SearchController.searchJobTitles);
router.post("/searchDegreesAndFields", SearchController.searchDegreesAndFields);

module.exports = router;
