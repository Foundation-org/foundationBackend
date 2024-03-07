const { ACCOUNT_BADGE_ADDED_AMOUNT } = require("../constants");
const UserModel = require("../models/UserModel");
const { createToken } = require("../service/auth");
const { createLedger } = require("../utils/createLedger");
const crypto = require("crypto");
const { updateTreasury } = require("../utils/treasuryService");
const { updateUserBalance } = require("../utils/userServices");
const { eduEmailCheck } = require("../utils/eduEmailCheck");
const jwt = require("jsonwebtoken");
const AWS = require("aws-sdk");
const { JWT_SECRET, FRONTEND_URL } = require("../config/env");

const update = async (req, res) => {
  try {
    const { userId, badgeId } = req.params;
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

const getBadges = async (req, res) => {
  try {
    const { userId } = req.params;
    const User = await UserModel.findOne({ uuid: userId });
    if (!User) throw new Error("No such User!");
    // Find the Badge
    const userBadges = User.badges;

    res.status(200).json({ userBadges });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: `An error occurred while update Ledger: ${error.message}`,
    });
  }
};

const addBadgeSocial = async (req, res) => {
  try {
    const User = await UserModel.findOne({ uuid: req.cookies.uuid });
    if (!User) throw new Error("No such User!");
    // Find the Badge
    const usersWithBadge = await UserModel.find({
      badges: { $elemMatch: { accountId: req.user._json.id } },
    });
    if (usersWithBadge.length !== 0) throw new Error("Badge already exist");

    const userBadges = User.badges;
    const updatedUserBadges = [
      ...userBadges,
      {
        accountId: req.user._json.id,
        accountName: req.user.provider,
        isVerified: true,
        type: "default",
      },
    ];
    // Update the user badges
    User.badges = updatedUserBadges;
    // Update the action
    await User.save();

    // Create Ledger
    await createLedger({
      uuid: User.uuid,
      txUserAction: "accountBadgeAdded",
      txID: crypto.randomBytes(11).toString("hex"),
      txAuth: "User",
      txFrom: User.uuid,
      txTo: "dao",
      txAmount: "0",
      txData: User.badges[0]._id,
      // txDescription : "User adds a verification badge"
    });
    await createLedger({
      uuid: User.uuid,
      txUserAction: "accountBadgeAdded",
      txID: crypto.randomBytes(11).toString("hex"),
      txAuth: "DAO",
      txFrom: "DAO Treasury",
      txTo: User.uuid,
      txAmount: ACCOUNT_BADGE_ADDED_AMOUNT,
      // txData : newUser.badges[0]._id,
      // txDescription : "Incentive for adding badges"
    });
    // Decrement the Treasury
    await updateTreasury({ amount: ACCOUNT_BADGE_ADDED_AMOUNT, dec: true });

    // Increment the UserBalance
    await updateUserBalance({
      uuid: User.uuid,
      amount: ACCOUNT_BADGE_ADDED_AMOUNT,
      inc: true,
    });

    res.clearCookie("social");
    res.status(200).json({ message: "Successful" });
  } catch (error) {
    res.status(500).json({
      message: `An error occurred while addSocialBadge: ${error.message}`,
    });
  }
};

const addContactBadge = async (req, res) => {
  try {
    const User = await UserModel.findOne({ uuid: req.body.uuid });
    if (!User) throw new Error("No such User!");
    // Check education Email
    if (req.body.type === "education") {
      // Check Email Category
      const emailStatus = await eduEmailCheck(req, res, req.body.email);
      console.log("🚀 ~ addContactBadge ~ emailStatus:", emailStatus);
      if (emailStatus.status !== "OK") throw new Error(emailStatus.message);
    }

    if (req.body.legacy) {
      // Find the Badge
      const usersWithBadge = await UserModel.find({
        badges: { $elemMatch: { email: req.body.email } },
      });
      // Find the User Email
      const usersWithEmail = await UserModel.find({
        email: req.body.email,
      });
      if (usersWithBadge.length !== 0 || usersWithEmail.length !== 0)
        throw new Error("Badge already exist");

      // Send an email
      await sendVerifyEmail({
        email: req.body.email,
        uuid: req.body.uuid,
        type: req.body.type,
      });
      res.status(201).json({
        message: `Sent a verification email to ${req.body.email}`,
      });
      return;
    }
    // Find the Badge
    const usersWithBadge = await UserModel.find({
      badges: { $elemMatch: { accountId: req.body.sub } },
    });
    if (usersWithBadge.length !== 0) throw new Error("Badge already exist");

    const userBadges = User.badges;
    const updatedUserBadges = [
      ...userBadges,
      {
        accountId: req.body.sub,
        accountName: req.body.provider,
        isVerified: true,
        type: req.body.type,
      },
    ];
    // Update the user badges
    User.badges = updatedUserBadges;
    // Update the action
    await User.save();

    // Create Ledger
    await createLedger({
      uuid: User.uuid,
      txUserAction: "accountBadgeAdded",
      txID: crypto.randomBytes(11).toString("hex"),
      txAuth: "User",
      txFrom: User.uuid,
      txTo: "dao",
      txAmount: "0",
      txData: User.badges[0]._id,
      // txDescription : "User adds a verification badge"
    });
    await createLedger({
      uuid: User.uuid,
      txUserAction: "accountBadgeAdded",
      txID: crypto.randomBytes(11).toString("hex"),
      txAuth: "DAO",
      txFrom: "DAO Treasury",
      txTo: User.uuid,
      txAmount: ACCOUNT_BADGE_ADDED_AMOUNT,
      // txData : newUser.badges[0]._id,
      // txDescription : "Incentive for adding badges"
    });
    // Decrement the Treasury
    await updateTreasury({ amount: ACCOUNT_BADGE_ADDED_AMOUNT, dec: true });

    // Increment the UserBalance
    await updateUserBalance({
      uuid: User.uuid,
      amount: ACCOUNT_BADGE_ADDED_AMOUNT,
      inc: true,
    });

    // res.clearCookie("social");
    res.status(200).json({ message: "Successful" });
  } catch (error) {
    res.status(500).json({
      message: `An error occurred while addContactBadge: ${error.message}`,
    });
  }
};

const addBadge = async (req, res) => {
  try {
    const User = await UserModel.findOne({ uuid: req.body.uuid });
    if (!User) throw new Error("No such User!");
    // Find the Badge
    const usersWithBadge = await UserModel.find({
      badges: { $elemMatch: { accountId: req.body.badgeAccountId } },
    });
    if (usersWithBadge.length !== 0) throw new Error("Badge already exist");

    const userBadges = User.badges;
    const updatedUserBadges = [
      ...userBadges,
      {
        accountId: req.body.badgeAccountId,
        accountName: req.body.provider,
        isVerified: true,
        type: "default",
      },
    ];
    // Update the user badges
    User.badges = updatedUserBadges;
    // Update the action
    await User.save();

    // Create Ledger
    await createLedger({
      uuid: User.uuid,
      txUserAction: "accountBadgeAdded",
      txID: crypto.randomBytes(11).toString("hex"),
      txAuth: "User",
      txFrom: User.uuid,
      txTo: "dao",
      txAmount: "0",
      txData: User.badges[0]._id,
      // txDescription : "User adds a verification badge"
    });
    await createLedger({
      uuid: User.uuid,
      txUserAction: "accountBadgeAdded",
      txID: crypto.randomBytes(11).toString("hex"),
      txAuth: "DAO",
      txFrom: "DAO Treasury",
      txTo: User.uuid,
      txAmount: ACCOUNT_BADGE_ADDED_AMOUNT,
      // txData : newUser.badges[0]._id,
      // txDescription : "Incentive for adding badges"
    });
    // Decrement the Treasury
    await updateTreasury({ amount: ACCOUNT_BADGE_ADDED_AMOUNT, dec: true });

    // Increment the UserBalance
    await updateUserBalance({
      uuid: User.uuid,
      amount: ACCOUNT_BADGE_ADDED_AMOUNT,
      inc: true,
    });

    res.status(200).json({ message: "Successful" });
  } catch (error) {
    res.status(500).json({
      message: `An error occurred while addSocialBadge: ${error.message}`,
    });
  }
};

const addPersonalBadge = async (req, res) => {
  try {
    const User = await UserModel.findOne({ uuid: req.body.uuid });
    if (!User) throw new Error("No such User!");

    const userBadges = User.badges;
    const updatedUserBadges = [
      ...userBadges,
      {
        personal: req.body.personal,
      },
    ];
    // Update the user badges
    User.badges = updatedUserBadges;
    // Update the action
    await User.save();

    // Create Ledger
    await createLedger({
      uuid: User.uuid,
      txUserAction: "personalBadgeAdded",
      txID: crypto.randomBytes(11).toString("hex"),
      txAuth: "User",
      txFrom: User.uuid,
      txTo: "dao",
      txAmount: "0",
      txData: User.badges[0]._id,
      // txDescription : "User adds a verification badge"
    });
    await createLedger({
      uuid: User.uuid,
      txUserAction: "personalBadgeAdded",
      txID: crypto.randomBytes(11).toString("hex"),
      txAuth: "DAO",
      txFrom: "DAO Treasury",
      txTo: User.uuid,
      txAmount: ACCOUNT_BADGE_ADDED_AMOUNT,
      // txData : newUser.badges[0]._id,
      // txDescription : "Incentive for adding badges"
    });
    // Decrement the Treasury
    await updateTreasury({ amount: ACCOUNT_BADGE_ADDED_AMOUNT, dec: true });

    // Increment the UserBalance
    await updateUserBalance({
      uuid: User.uuid,
      amount: ACCOUNT_BADGE_ADDED_AMOUNT,
      inc: true,
    });

    res.status(200).json({ message: "Successful" });
  } catch (error) {
    res.status(500).json({
      message: `An error occurred while addSocialBadge: ${error.message}`,
    });
  }
};

const addWeb3Badge = async (req, res) => {

  console.log(req.body);
  try {
    const User = await UserModel.findOne({ uuid: req.body.uuid });
    if (!User) throw new Error("No such User!");

    const userBadges = User.badges;
    const updatedUserBadges = [
      ...userBadges,
      {
        web3: req.body.web3,
      },
    ];
    // Update the user badges
    User.badges = updatedUserBadges;
    // Update the action
    await User.save();

    // Create Ledger
    await createLedger({
      uuid: User.uuid,
      txUserAction: "web3BadgeAdded",
      txID: crypto.randomBytes(11).toString("hex"),
      txAuth: "User",
      txFrom: User.uuid,
      txTo: "dao",
      txAmount: "0",
      txData: User.badges[0]._id,
    });
    await createLedger({
      uuid: User.uuid,
      txUserAction: "web3BadgeAdded",
      txID: crypto.randomBytes(11).toString("hex"),
      txAuth: "DAO",
      txFrom: "DAO Treasury",
      txTo: User.uuid,
      txAmount: ACCOUNT_BADGE_ADDED_AMOUNT,
    });
    // Decrement the Treasury
    await updateTreasury({ amount: ACCOUNT_BADGE_ADDED_AMOUNT, dec: true });

    // Increment the UserBalance
    await updateUserBalance({
      uuid: User.uuid,
      amount: ACCOUNT_BADGE_ADDED_AMOUNT,
      inc: true,
    });

    res.status(200).json({ message: "Successful" });
  } catch (error) {
    res.status(500).json({
      message: `An error occurred while addWeb3Badge: ${error.message}`,
    });
  }
};
const removePersonalBadge = async (req, res) => {
  try {
    const User = await UserModel.findOne({ uuid: req.body.uuid });
    if (!User) throw new Error("No such User!");

    const userBadges = User.badges;
    const updatedUserBadges =
      userBadges?.filter(
        (badge) => !badge?.personal?.hasOwnProperty(req.body.type)
      ) || [];
    // Update the user badges
    User.badges = updatedUserBadges;
    // Update the action
    await User.save();

    // Create Ledger
    await createLedger({
      uuid: User.uuid,
      txUserAction: "personalBadgeRemoved",
      txID: crypto.randomBytes(11).toString("hex"),
      txAuth: "User",
      txFrom: User.uuid,
      txTo: "dao",
      txAmount: "0",
      txData: User.badges[0]._id,
      // txDescription : "User adds a verification badge"
    });
    res.status(200).json({ message: "Successful" });
  } catch (error) {
    res.status(500).json({
      message: `An error occurred while addPersonalBadge: ${error.message}`,
    });
  }
};

const updatePersonalBadge = async (req, res) => {
  try {
    const User = await UserModel.findOne({ uuid: req.body.uuid });
    if (!User) throw new Error("No such User!");

    const userBadges = User.badges;

    userBadges?.forEach((badge) => {
      if (badge?.personal?.hasOwnProperty(req.body.type)) {
        badge.personal[itemType] = req.body.newValue;
      }
    });
    // Update the user badges
    User.badges = updatedUserBadges;
    // Update the action
    await User.save();

    res.status(200).json({ message: "Successful" });
  } catch (error) {
    res.status(500).json({
      message: `An error occurred while updatePersonalBadge: ${error.message}`,
    });
  }
};

const removeBadge = async (req, res) => {
  try {
    const User = await UserModel.findOne({ uuid: req.body.uuid });
    if (!User) throw new Error("No such User!");
    // Find the Badge
    const usersWithBadge = await UserModel.find({
      badges: { $elemMatch: { accountId: req.body.badgeAccountId } },
    });
    if (usersWithBadge.length === 0) throw new Error("Badge not exist!");

    const userBadges = User.badges;
    const updatedUserBadges = userBadges.filter((item) => {
      if (item.accountId !== req.body.badgeAccountId) {
        return item;
      }
    });
    // Update the user badges
   

    // Create Ledger
    await createLedger({
      uuid: User.uuid,
      txUserAction: "accountBadgeRemoved",
      txID: crypto.randomBytes(11).toString("hex"),
      txAuth: "User",
      txFrom: User.uuid,
      txTo: "dao",
      txAmount: "0",
      txData: User.badges[0]._id,
      // txDescription : "User adds a verification badge"
    });

    User.badges = updatedUserBadges;
    // Update the action
    await User.save();
    // // Create Ledger
    // await createLedger({
    //   uuid: User.uuid,
    //   txUserAction: "accountBadgeAdded",
    //   txID: crypto.randomBytes(11).toString("hex"),
    //   txAuth: "User",
    //   txFrom: User.uuid,
    //   txTo: "dao",
    //   txAmount: "0",
    //   txData: User.badges[0]._id,
    //   // txDescription : "User adds a verification badge"
    // });
    // await createLedger({
    //   uuid: User.uuid,
    //   txUserAction: "accountBadgeAdded",
    //   txID: crypto.randomBytes(11).toString("hex"),
    //   txAuth: "DAO",
    //   txFrom: "DAO Treasury",
    //   txTo: User.uuid,
    //   txAmount: ACCOUNT_BADGE_ADDED_AMOUNT,
    //   // txData : newUser.badges[0]._id,
    //   // txDescription : "Incentive for adding badges"
    // });
    // // Decrement the Treasury
    // await updateTreasury({ amount: ACCOUNT_BADGE_ADDED_AMOUNT, dec: true });

    // // Increment the UserBalance
    // await updateUserBalance({
    //   uuid: User.uuid,
    //   amount: ACCOUNT_BADGE_ADDED_AMOUNT,
    //   inc: true,
    // });

    res.status(200).json({ message: "Successful" });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: `An error occurred while addSocialBadge: ${error.message}`,
    });
  }
};

const sendVerifyEmail = async ({ email, uuid, type }) => {
  try {
    const verificationTokenFull = jwt.sign({ uuid, email, type }, JWT_SECRET, {
      expiresIn: "10m",
    });
    const verificationToken = verificationTokenFull.substr(
      verificationTokenFull.length - 6
    );

    // const verificationToken = user.generateVerificationToken();
    console.log("verificationToken", verificationToken);

    // Step 3 - Email the user a unique verification link
    // const url = `${FRONTEND_URL}/VerifyCode?token=${verificationTokenFull}&badge=true`;
    const url = `${FRONTEND_URL}/badgeverifycode?token=${verificationTokenFull}&badge=true`;

    const SES_CONFIG = {
      region: process.env.AWS_SES_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    };
    // Create SES service object
    console.log("before sesClient", SES_CONFIG);

    const sesClient = new AWS.SES(SES_CONFIG);

    let params = {
      Source: process.env.AWS_SES_SENDER,
      Destination: {
        ToAddresses: [email],
      },
      ReplyToAddresses: [],
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: `Click <a href = '${url}'>here</a> to confirm your email <br /> <br /> <br />
                   And confirm this code <b>${verificationToken}</b> from the App`,
          },
          Text: {
            Charset: "UTF-8",
            Data: "Verify Accountt",
          },
        },

        Subject: {
          Charset: "UTF-8",
          Data: "Verify Account",
        },
      },
    };

    try {
      const emailRes = await sesClient.sendEmail(params).promise();
      return emailRes;
    } catch (error) {
      console.log(error);
    }

    // return res.status(200).send({
    //   message: `Sent a verification email to ${email}`,
    // });
  } catch (error) {
    console.error(error.message);
    // res.status(500).json({
    //   message: `An error occurred while sendVerifyEmail Auth: ${error.message}`,
    // });
  }
};

const addContactBadgeVerify = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const decodedToken = jwt.verify(token, JWT_SECRET);

    const User = await UserModel.findOne({ uuid: decodedToken.uuid });
    if (!User) throw new Error("No such User!");

    // Find the Badge
    const usersWithBadge = await UserModel.find({
      badges: { $elemMatch: { email: decodedToken.email } },
    });
    // Find the User Email
    const usersWithEmail = await UserModel.find({
      email: decodedToken.email,
    });
    if (usersWithBadge.length !== 0 || usersWithEmail.length !== 0)
      throw new Error("Badge already exist");

    // const userBadges = User.badges;
    // const updatedUserBadges = [
    //   ...userBadges,
    //   {
    //     email: decodedToken.email,
    //     isVerified: false,
    //     type: decodedToken.type,
    //   },
    // ];
    // // Update the user badges
    // User.badges = updatedUserBadges;
    // // Update the action
    // await User.save();

    return res.status(200).json({ message: "Continue" });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const addContactBadgeAdd = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const decodedToken = jwt.verify(token, JWT_SECRET);

    const User = await UserModel.findOne({ uuid: decodedToken.uuid });
    if (!User) throw new Error("No such User!");

    // Find the Badge
    const usersWithBadge = await UserModel.find({
      badges: { $elemMatch: { email: decodedToken.email } },
    });
    // Find the User Email
    const usersWithEmail = await UserModel.find({
      email: decodedToken.email,
    });
    if (usersWithBadge.length !== 0 || usersWithEmail.length !== 0)
      throw new Error("Badge already exist");

    const userBadges = User.badges;
    const updatedUserBadges = [
      ...userBadges,
      {
        email: decodedToken.email,
        isVerified: true,
        type: decodedToken.type,
      },
    ];
    // Update the user badges
    User.badges = updatedUserBadges;
    // Update the action
    await User.save();
    res.status(200).json({ ...User._doc });
  } catch (error) {
    return res.status(500).json({
      // message: error.message,
      message: `An error occurred while addContactBadge: ${error.message}`,
    });
  }
};

module.exports = {
  update,
  getBadges,
  addBadgeSocial,
  addBadge,
  removeBadge,
  addContactBadge,
  addContactBadgeVerify,
  addContactBadgeAdd,
  addPersonalBadge,
  removePersonalBadge,
  updatePersonalBadge,
  addWeb3Badge,
};
