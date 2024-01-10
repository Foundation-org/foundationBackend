const passport = require("passport");
const User = require("../models/UserModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const { OAuth2Client } = require("google-auth-library");
const { eduEmailCheck } = require("../utils/eduEmailCheck");
const { createLedger } = require("../utils/createLedger");
const { updateTreasury } = require("../utils/treasuryService");
const { updateUserBalance } = require("../utils/userServices");
const { ACCOUNT_BADGE_ADDED_AMOUNT } = require("../constants");
const { createToken } = require("../service/auth");
const { FRONTEND_URL } = require("../config/env");

// Github
const githubSuccess = async (req, res) => {
  passport.authenticate("github", { scope: ["user"] });
};

const githubFailure = async (req, res) => {
  passport.authenticate("github", { failureRedirect: "/auth/login/failed" });
};
const githubCallback = async (req, res) => {
  res.redirect(process.env.FRONTEND_ORIGIN);
};

// Twitter
const twitterSuccess = async (req, res) => {
  passport.authenticate("twitter", { scope: ["user"] });
};

const twitterFailure = async (req, res) => {
  passport.authenticate("twitter", { failureRedirect: "/auth/login/failed" });
};
const twitterCallback = async (req, res) => {
  res.redirect(process.env.FRONTEND_ORIGIN);
};

// Google
const googleSuccess = async (req, res) => {
  passport.authenticate("google", { scope: ["user"] });
};

const googleFailure = async (req, res) => {
  passport.authenticate("google", { failureRedirect: "/auth/login/failed" });
};
const googleCallback = async (req, res) => {
  res.redirect(process.env.FRONTEND_ORIGIN);
};

const googleHandler = async (req, res) => {
  try {
    // if(req.query.GoogleAccount){
    //   signUpUserBySocialLogin(req, res)
    // }
    // Check Google Account
    const payload = req.user;
    // Check if email already exist
    const user = await User.findOne({ email: payload.emails[0].value });

    //   Signup User
    if (!user) {
      const uuid = crypto.randomBytes(11).toString("hex");
      const newUser = await new User({
        email: payload.emails[0].value,
        uuid: uuid,
      });

      // Check Email Category
      const emailStatus = await eduEmailCheck(req, res, payload.email);
      let type = "";
      if (emailStatus.status === "OK") type = "Education";

      // Create a Badge at starting index
      newUser.badges.unshift({
        accountName: "Gmail",
        isVerified: payload.email_verified,
        type: type,
      });

      // Update newUser verification status to true
      newUser.gmailVerified = payload.emails[0].verified;

      // Create Ledger
      await createLedger({
        uuid: uuid,
        txUserAction: "accountBadgeAdded",
        txID: crypto.randomBytes(11).toString("hex"),
        txAuth: "User",
        txFrom: uuid,
        txTo: "dao",
        txAmount: "0",
        txData: newUser.badges[0]._id,
        // txDescription : "User adds a verification badge"
      });
      await createLedger({
        uuid: uuid,
        txUserAction: "accountBadgeAdded",
        txID: crypto.randomBytes(11).toString("hex"),
        txAuth: "DAO",
        txFrom: "DAO Treasury",
        txTo: uuid,
        txAmount: ACCOUNT_BADGE_ADDED_AMOUNT,
        // txData : newUser.badges[0]._id,
        // txDescription : "Incentive for adding badges"
      });
      //

      if (newUser.badges[0].type !== "Education") {
        newUser.requiredAction = true;
      }
      await newUser.save();

      // Decrement the Treasury
      await updateTreasury({ amount: ACCOUNT_BADGE_ADDED_AMOUNT, dec: true });

      // Increment the UserBalance
      await updateUserBalance({
        uuid: newUser.uuid,
        amount: ACCOUNT_BADGE_ADDED_AMOUNT,
        inc: true,
      });

      // Generate a JWT token
      const token = createToken({ uuid: newUser.uuid });

      res.cookie("jwt", token);
      res.cookie("uuid", newUser.uuid);
      res.redirect(`${FRONTEND_URL}/auth0`);
      return;
    }
    //   Sign in User

    // Generate a JWT token
    const token = createToken({ uuid: user.uuid });

    // Create Ledger
    await createLedger({
      uuid: user.uuid,
      txUserAction: "accountLogin",
      txID: crypto.randomBytes(11).toString("hex"),
      txAuth: "User",
      txFrom: user.uuid,
      txTo: "dao",
      txAmount: "0",
      txData: user.uuid,
      // txDescription : "user logs in"
    });

    res.cookie("jwt", token);
    res.cookie("uuid", user.uuid);
    res.redirect(`${FRONTEND_URL}/auth0`);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      message: `An error occurred while signUpUser Auth: ${error.message}`,
    });
  }
};

const addBadge = async (req, res) => {
  try {
    // const { userId, badgeId } = req.params;
    const User = await UserModel.findOne({ _id: userId });
    if (!User) throw new Error("No such User!");
    // Find the Badge
    const userBadges = User.badges;
    const updatedUserBadges = userBadges.map((item) => {
      if (item._id.toHexString() == badgeId) {
        return { ...item, type: req.body.type };
        // return item.type = req.body.type;
      }
    });
    // Update the user badges
    User.badges = updatedUserBadges;
    // Update the action
    User.requiredAction = false;
    await User.save();

    // Generate a JWT token
    const token = createToken({ uuid: User.uuid });

    res.status(200).json({ ...User._doc, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: `An error occurred while update Ledger: ${error.message}`,
    });
  }
};

module.exports = {
  githubSuccess,
  githubFailure,
  githubCallback,
  twitterSuccess,
  twitterFailure,
  twitterCallback,
  googleSuccess,
  googleFailure,
  googleCallback,
  googleHandler,
  addBadge,
};
