const express = require("express");
const router = express.Router();
// controller
const BadgeController = require("../controller/BadgeController");
// middleware
const protect = require("../middleware/protect");
const socialProtect = require("../middleware/socialProtect");

router.patch("/updateBadge/:userId/:badgeId", BadgeController.update);

router.get("/getBadges/:userId", BadgeController.getBadges);

router.post("/addBadge/social", socialProtect, BadgeController.addBadgeSocial);

router.post("/addBadge/contact", BadgeController.addContactBadge);

router.post("/addBadge/contact/verify", BadgeController.addContactBadgeVerify);

router.post("/addBadge/contact/add", BadgeController.addContactBadgeAdd);

router.post("/addBadge", BadgeController.addBadge);

router.post("/removeBadge", BadgeController.removeBadge);

module.exports = router;
