const express = require("express");
const router = express.Router();
// controller
const BadgeController = require("../controller/BadgeController");
// middleware
const protect = require("../middleware/protect");


// router.post("/createBadge", BadgeController.create);

router.patch("/updateBadge/:userId/:badgeId", BadgeController.update);

router.get("/getBadges/:userId", BadgeController.getBadges);

// router.get("/getAllBadge", BadgeController.getAll);

// router.post("/searchBadge",BadgeController.search);

// router.delete("/deleteBadge/:id", BadgeController.remove);

module.exports = router;
