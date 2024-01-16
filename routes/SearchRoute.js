const express = require("express");
const router = express.Router();
// controller
const SearchController = require("../controller/SearchController");
// middleware
const protect = require("../middleware/protect");

router.post("/easySearch", SearchController.easySearch);
router.post("/searchBookmarks", SearchController.searchBookmarks);

module.exports = router;
