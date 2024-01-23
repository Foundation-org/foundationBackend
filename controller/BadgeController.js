const { ACCOUNT_BADGE_ADDED_AMOUNT } = require("../constants");
const UserModel = require("../models/UserModel");
const { createToken } = require("../service/auth");
const { createLedger } = require("../utils/createLedger");
const crypto = require("crypto");
const { updateTreasury } = require("../utils/treasuryService");
const { updateUserBalance } = require("../utils/userServices");

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
    const usersWithBadge = await UserModel.find({ 'badges': { $elemMatch: { accountId: req.user._json.id } } });
    if (usersWithBadge.length !== 0) throw new Error("Badge already exist");

    const userBadges = User.badges;
    const updatedUserBadges = [
      ...userBadges,
      { accountId: req.user._json.id, accountName: req.user.provider, isVerified: true, type: "default" },
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

module.exports = {
  update,
  getBadges,
  addBadgeSocial,
};
