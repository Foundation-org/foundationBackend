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

router.post("/signUp/guestMode", AuthController.signUpGuestMode);

router.post("/signUpSocial/guestMode", AuthController.signUpSocialGuestMode);

router.post("/userInfo", AuthController.userInfo);

router.post("/userInfoById", AuthController.userInfoById);

router.put("/setUserWallet", AuthController.setUserWallet);

router.put("/signedUuid", AuthController.signedUuid);

router.post("/sendVerifyEmail", AuthController.sendVerifyEmail);

router.post("/verify", protect, AuthController.verify);

router.post("/authenticateJWT",  AuthController.AuthenticateJWT);

router.post("/referral", AuthController.verifyReferralCode);

router.delete("/delete/:uuid", AuthController.deleteByUUID);

router.post("/logout", AuthController.logout);

router.post("/setStates", AuthController.setStates);

router.post("/setBookmarkStates", AuthController.setBookmarkStates);

router.delete("/badge/:id/:uuid", AuthController.deleteBadgeById);

router.post("/get-insta-token",AuthController.getInstaToken)

router.post("/getLinkedInUserInfo",AuthController.getLinkedInUserInfo)

module.exports = router;
