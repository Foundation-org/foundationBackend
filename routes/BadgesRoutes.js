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

router.post("/addBadge/personal/add", BadgeController.addPersonalBadge);
router.post(
  "/addBadge/personal/addWorkOrEducation",
  BadgeController.addWorkEducationBadge
);

router.post(
  "/addBadge/personal/deleteWorkOrEducation",
  BadgeController.removeAWorkEducationBadge
);

router.post(
  "/addBadge/personal/getWorkOrEducation",
  BadgeController.getAWorkAndEducationBadge
);

router.post(
  "/addBadge/personal/updateWorkOrEducation",
  BadgeController.updateWorkAndEducationBadge
);

router.post("/addBadge/company/add", BadgeController.addCompany);

router.post("/removeBadge", BadgeController.removeBadge);

router.post("/removeContactBadge", BadgeController.removeContactBadge);

router.post("/removePersonalBadge", BadgeController.removePersonalBadge);

router.post("/removeWeb3Badge", BadgeController.removeWeb3Badge);

router.post("/addBadge/web3/add", BadgeController.addWeb3Badge);

router.post("/addBadge/passkey/add", BadgeController.addPasskeyBadge);

router.post("/removePasskey", BadgeController.removePasskeyBadge);

module.exports = router;
