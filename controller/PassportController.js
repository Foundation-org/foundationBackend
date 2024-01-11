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
const UserModel = require("../models/UserModel");

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

      res.cookie("jwt", token, { httpOnly: true });
      res.cookie("uuid", newUser.uuid, { httpOnly: true });
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

    res.cookie("jwt", token, { httpOnly: true });
    res.cookie("uuid", user.uuid), { httpOnly: true };
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
        console.log(req.user);
        // console.log("🚀 ~ addBadge ~ req.user:", req.user)
        // return
        // const { userId, badgeId } = req.params;
        if(!req.user._json.email) throw new Error("No Email Exist!")
        const User = await UserModel.findOne({ email: req.user._json.email });
        if(!User) throw new Error("No such User!");
        // Find the Badge
        const userBadges = User.badges;
        const updatedUserBadges = [...userBadges, { accountName: req.user.provider, isVerified: true, type: "default" }]
        // console.log("🚀 ~ addBadge ~ updatedUserBadges:", updatedUserBadges)
        // Update the user badges
        User.badges = updatedUserBadges;
        // Update the action
        await User.save();

        // Create Ledger
        await createLedger(
            {
                uuid : User.uuid,
                txUserAction : "accountBadgeAdded",
                txID : crypto.randomBytes(11).toString("hex"),
                txAuth : "User",
                txFrom : User.uuid,
                txTo : "dao",
                txAmount : "0",
                txData : User.badges[0]._id,
                // txDescription : "User adds a verification badge"
            })
            await createLedger(
                {
                    uuid : User.uuid,
                    txUserAction : "accountBadgeAdded",
                    txID : crypto.randomBytes(11).toString("hex"),
                    txAuth : "DAO",
                    txFrom : "DAO Treasury",
                    txTo : User.uuid,
                    txAmount : ACCOUNT_BADGE_ADDED_AMOUNT,
                    // txData : newUser.badges[0]._id,
                    // txDescription : "Incentive for adding badges"
                })
        // Decrement the Treasury
        await updateTreasury({ amount: ACCOUNT_BADGE_ADDED_AMOUNT, dec: true })
            
        // Increment the UserBalance
        await updateUserBalance({ uuid: User.uuid, amount: ACCOUNT_BADGE_ADDED_AMOUNT, inc: true })

        res.redirect(`${FRONTEND_URL}/profile/verification-badges`);

    } catch (error) {
    //   res.redirect(500).json({ message: `An error occurred while update Ledger: ${error.message}` });
        console.log("🚀 ~ addBadge ~ error.message:", error.message)
        res.redirect(`${FRONTEND_URL}/profile/verification-badges`);
    }
  };

  const socialBadgeToken = async(req, res) => {
    // 
    const token = createToken({ _json: req.user._json, provider: req.user.provider });
    res.cookie("social", token, { httpOnly: true, maxAge: 1000 * 60 });
    res.redirect(`${FRONTEND_URL}/profile/verification-badges?social=true`);
  }

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
  socialBadgeToken
};
