const express = require("express");
const router = express.Router();
// controller
const PassportController = require("../controller/PassportController");
// middleware
const protect = require("../middleware/protect");
const cache = require("../middleware/cache");

// github auth
router.get("/github", PassportController.githubSuccess);
router.get("/github/callback", PassportController.githubFailure, PassportController.githubCallback);

// twitter auth
router.get("/twitter", PassportController.twitterSuccess);
router.get("/twitter/callback", PassportController.twitterFailure, PassportController.twitterCallback);

// Google auth
router.get("/google", PassportController.googleSuccess);
router.get("/google/callback", PassportController.googleFailure, PassportController.googleCallback);

module.exports = router; 