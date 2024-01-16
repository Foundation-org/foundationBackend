const express = require("express");
const router = express.Router();
// controller
const AuthController = require("../controller/AuthController");
// middleware
const protect = require("../middleware/protect");
const cache = require("../middleware/cache");
const passport = require("passport");

router.put("/changePassword", AuthController.changePassword);

router.post("/signUpUser", AuthController.signUpUser);

router.post("/signUpUser/social", AuthController.signUpUserBySocialLogin);

router.post("/signInUser/social", AuthController.signInUserBySocialLogin);

router.post("/signInUser", AuthController.signInUser);

router.post("/send/email", AuthController.sendEmail);

router.post("/create/guestMode", AuthController.createGuestMode);

router.post("/signIn/guestMode", AuthController.signInGuestMode);

router.post("/signInSocial/guestMode", AuthController.signInSocialGuestMode);

router.post("/userInfo", AuthController.userInfo);

router.put("/setUserWallet", AuthController.setUserWallet);

router.put("/signedUuid", AuthController.signedUuid);

router.post("/sendVerifyEmail", AuthController.sendVerifyEmail);

router.post("/verify", AuthController.verify);

router.delete("/delete/:uuid", AuthController.deleteByUUID);

router.post("/logout", AuthController.logout);

router.delete("/badge/:id/:uuid", AuthController.deleteBadgeById);

module.exports = router;
