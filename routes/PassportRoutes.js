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

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Endpoints for authentication using third-party providers
 */

router.get("/login/failed",
  /**
   * @swagger
   * /login/failed:
   *   get:
   *     summary: Failed login
   *     description: Endpoint to handle failed login attempts
   *     responses:
   *       '401':
   *         description: Unauthorized - login failure
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 message:
   *                   type: string
   *                   example: failure
   */
  (req, res) => {
    res.status(401).json({
      success: false,
      message: "failure",
    });
  }
);

// Github
router.get("/github",
  /**
   * @swagger
   * /github:
   *   get:
   *     summary: Authenticate with GitHub
   *     description: Endpoint to initiate authentication with GitHub
   *     responses:
   *       '302':
   *         description: Redirect to GitHub authentication page
   */
  passport.authenticate("github", { scope: ["user:email"] })
);

router.get("/github/callback",
  /**
   * @swagger
   * /github/callback:
   *   get:
   *     summary: GitHub authentication callback
   *     description: Endpoint to handle callback after GitHub authentication
   *     responses:
   *       '302':
   *         description: Redirect to client URL
   */
  passport.authenticate("github", {
    failureRedirect: CLIENT_URL,
    session: false,
  }),
  PassportController.socialBadgeToken
);

// LinkedIn
router.get("/linkedin",
  /**
   * @swagger
   * /linkedin:
   *   get:
   *     summary: Authenticate with LinkedIn
   *     description: Endpoint to initiate authentication with LinkedIn
   *     responses:
   *       '302':
   *         description: Redirect to LinkedIn authentication page
   */
  passport.authenticate("linkedin", { scope: ["profile"] })
);

router.get("/linkedin/callback",
  /**
   * @swagger
   * /linkedin/callback:
   *   get:
   *     summary: LinkedIn authentication callback
   *     description: Endpoint to handle callback after LinkedIn authentication
   *     responses:
   *       '302':
   *         description: Redirect to client URL
   */
  passport.authenticate("linkedin", {
    failureRedirect: CLIENT_URL,
    session: false,
  }),
  PassportController.socialBadgeToken
);

// Twitter
router.get("/twitter",
  /**
   * @swagger
   * /twitter:
   *   get:
   *     summary: Authenticate with Twitter
   *     description: Endpoint to initiate authentication with Twitter
   *     responses:
   *       '302':
   *         description: Redirect to Twitter authentication page
   */
  passport.authenticate("twitter", { session: false })
);

router.get("/twitter/callback",
  /**
   * @swagger
   * /twitter/callback:
   *   get:
   *     summary: Twitter authentication callback
   *     description: Endpoint to handle callback after Twitter authentication
   *     responses:
   *       '302':
   *         description: Redirect to client URL
   */
  passport.authenticate("twitter", {
    failureRedirect: CLIENT_URL,
    session: false,
  }),
  PassportController.socialBadgeToken
);

// Instagram
router.get("/instagram",
  /**
   * @swagger
   * /instagram:
   *   get:
   *     summary: Authenticate with Instagram
   *     description: Endpoint to initiate authentication with Instagram
   *     responses:
   *       '302':
   *         description: Redirect to Instagram authentication page
   */
  passport.authenticate("instagram")
);

router.get("/instagram/callback",
  /**
   * @swagger
   * /instagram/callback:
   *   get:
   *     summary: Instagram authentication callback
   *     description: Endpoint to handle callback after Instagram authentication
   *     responses:
   *       '302':
   *         description: Redirect to client URL
   */
  passport.authenticate("instagram", {
    failureRedirect: CLIENT_URL,
    session: false,
  }),
  PassportController.socialBadgeToken
);

// Google
router.get("/login/success",
  /**
   * @swagger
   * /login/success:
   *   get:
   *     summary: Successful login
   *     description: Endpoint to handle successful login
   *     responses:
   *       '200':
   *         description: Successful login response
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/SuccessfulLoginResponse'
   */
  (req, res) => {
    if (req.user) {
      res.status(200).json({
        success: true,
        message: "successfull",
        user: req.user,
      });
    }
  }
);

router.get("/google",
  /**
   * @swagger
   * /google:
   *   get:
   *     summary: Authenticate with Google
   *     description: Endpoint to initiate authentication with Google
   *     responses:
   *       '302':
   *         description: Redirect to Google authentication page
   */
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get("/google/callback",
  /**
   * @swagger
   * /google/callback:
   *   get:
   *     summary: Google authentication callback
   *     description: Endpoint to handle callback after Google authentication
   *     responses:
   *       '302':
   *         description: Redirect to client URL
   */
  passport.authenticate("google", {
    failureRedirect: CLIENT_URL,
    session: false,
  }),
  PassportController.googleHandler
);

router.get("/facebook",
  /**
   * @swagger
   * /facebook:
   *   get:
   *     summary: Authenticate with Facebook
   *     description: Endpoint to initiate authentication with Facebook
   *     responses:
   *       '302':
   *         description: Redirect to Facebook authentication page
   */
  passport.authenticate("facebook", { scope: ["email"] })
);

router.get("/facebook/callback",
  /**
   * @swagger
   * /facebook/callback:
   *   get:
   *     summary: Facebook authentication callback
   *     description: Endpoint to handle callback after Facebook authentication
   *     responses:
   *       '302':
   *         description: Redirect to client URL
   */
  passport.authenticate("facebook", {
    failureRedirect: CLIENT_URL,
    session: false,
  }),
  PassportController.googleHandler
);
module.exports = router;
