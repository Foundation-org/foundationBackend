const passport = require("passport");
const express = require("express");
const router = express.Router();
// controller
const PassportController = require("../controller/PassportController");
// middleware
const protect = require("../middleware/protect");
const cache = require("../middleware/cache");
const { FRONTEND_URL } = require("../config/env");

const CLIENT_URL = `${FRONTEND_URL}/profile/verification-badges`;

router.get("/login/failed", (req, res) => {
  res.status(401).json({
    success: false,
    message: "failure",
  });
});

//   Github
router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

router.get(
  "/github/callback",
  passport.authenticate("github", {
    // successRedirect: CLIENT_URL,
    failureRedirect: CLIENT_URL,
    session: false,
  }),
  PassportController.socialBadgeToken
);

//   LinkedIn
router.get(
  "/linkedin",
  passport.authenticate("linkedin", { scope: ["profile"] })
);

router.get(
  "/linkedin/callback",
  passport.authenticate("linkedin", {
    // successRedirect: CLIENT_URL,
    failureRedirect: CLIENT_URL,
    session: false,
  }),
  PassportController.socialBadgeToken
);

//   LinkedIn
router.get("/twitter", passport.authenticate("twitter", { session: false }));

router.get(
  "/twitter/callback",
  passport.authenticate("twitter", {
    // successRedirect: CLIENT_URL,
    failureRedirect: CLIENT_URL,
    session: false,
  }),
  PassportController.socialBadgeToken
);

//   Google
router.get("/login/success", (req, res) => {
  if (req.user) {
    res.status(200).json({
      success: true,
      message: "successfull",
      user: req.user,
      //   cookies: req.cookies
    });
  }
});

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    // successRedirect: CLIENT_URL,
    failureRedirect: CLIENT_URL,
    session: false,
  }),
  PassportController.googleHandler
);
module.exports = router;
