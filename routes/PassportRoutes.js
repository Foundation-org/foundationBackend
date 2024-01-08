const passport = require("passport")
const express = require("express");
const router = express.Router();
// controller
const PassportController = require("../controller/PassportController");
// middleware
const protect = require("../middleware/protect");
const cache = require("../middleware/cache");


const CLIENT_URL = "https://localhost:5173/profile";

router.get("/login/failed", (req, res) => {
    res.status(401).json({
      success: false,
      message: "failure",
    });
  });


//   Github
router.get("/github", passport.authenticate("github", { scope: ["profile"] }));

router.get(
  "/github/callback",
  passport.authenticate("github", {
    successRedirect: CLIENT_URL,
    failureRedirect: "/login/failed",
  })
);


//   LinkedIn
router.get("/linkedin", passport.authenticate("linkedin", { scope: ["profile"] }));

router.get(
  "/linkedin/callback",
  passport.authenticate("linkedin", {
    successRedirect: CLIENT_URL,
    failureRedirect: "/login/failed",
  })
);

//   LinkedIn
router.get("/twitter", passport.authenticate("twitter"));

router.get(
  "/twitter/callback",
  passport.authenticate("twitter", {
    successRedirect: CLIENT_URL,
    failureRedirect: "/login/failed",
  })
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

router.get("/google", passport.authenticate("google", { scope: ['profile', 'email']}));

router.get("/google/callback",
  passport.authenticate("google", {
    // successRedirect: CLIENT_URL,
    failureRedirect: "/login/failed",
  }),
  PassportController.googleHandler
);

// router.get('/google/callback',
//   passport.authenticate('google', { failureRedirect: '/' }),
//   (req, res) => {
//     console.log("🚀 ~ file: PassportRoutes.js:69 ~ req:", req)
//     // Instead of redirecting, you can send data in the response
//     res.json({ user: req.user });
//   }
// );
// github auth
// router.get("/github", passport.authenticate("github", { scope: ["user"] }));
// router.get("/auth/github/fail", (req, res, next) => {
//     res.send('login failed');
// })
// router.get("/auth/github/callback", passport.authenticate('github',
// {failureRedirect: '/github/fail'}))
// router.get("/github/callback", PassportController.githubFailure, PassportController.githubCallback);

// twitter auth
// router.get("/twitter", PassportController.twitterSuccess);
// router.get("/twitter/callback", PassportController.twitterFailure, PassportController.twitterCallback);

// // Google auth
// router.get("/google", PassportController.googleSuccess);
// router.get("/google/callback", PassportController.googleFailure, PassportController.googleCallback);

module.exports = router; 