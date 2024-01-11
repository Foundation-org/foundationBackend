const { ACCOUNT_BADGE_ADDED_AMOUNT } = require("../constants");
const UserModel = require("../models/UserModel");
const { createToken } = require("../service/auth");
const { createLedger } = require("../utils/createLedger");
const crypto = require("crypto");
const { updateTreasury } = require("../utils/treasuryService");
const { updateUserBalance } = require("../utils/userServices");


// const create = async (req, res) => {
//   try {
//     const ledger = await new UserModel({ ...req.body });
//     const savedLedger = await ledger.save();
//     if (!savedLedger) throw new Error("Ledger Not Created Successfully!");
//     res.status(201).json({ data: savedLedger });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: `An error occurred while create Ledger: ${error.message}` });
//   }
// };


const update = async (req, res) => {
    try {
        const { userId, badgeId } = req.params;
        const User = await UserModel.findOne({ _id: userId });
        if(!User) throw new Error("No such User!");
        // Find the Badge
        const userBadges = User.badges;
        const updatedUserBadges = userBadges.map(item => {
            if(item._id.toHexString()  == badgeId){
                return { ...item, type: req.body.type }
                // return item.type = req.body.type;
            };
        })
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
      res.status(500).json({ message: `An error occurred while update Ledger: ${error.message}` });
    }
  };


  const getBadges = async (req, res) => {
    try {
        const { userId } = req.params;
        const User = await UserModel.findOne({ uuid: userId });
        if(!User) throw new Error("No such User!");
        // Find the Badge
        const userBadges = User.badges;

        res.status(200).json({ userBadges });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: `An error occurred while update Ledger: ${error.message}` });
    }
  };










const getById = async (req, res) => {
  try {
    const { page, limit, uuid } = req.query;
    const skip = (page - 1) * limit;

    const ledger = await UserModel.find({ uuid })
      .sort({ _id: 1 }) // Adjust the sorting based on your needs
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await UserModel.countDocuments({ uuid });
    const pageCount = Math.ceil(totalCount / limit);

    res.status(200).json({
      data: ledger,
      pageCount,
      totalCount,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        message: `An error occurred while getById Ledger: ${error.message}`,
      });
  }
};


const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const ledger = UserModel.findByIdAndDelete(id)
    res.status(200).json({ data: ledger });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `An error occurred while remove Ledger: ${error.message}` });
  }
};

const addBadgeSocial = async (req, res) => {
  try {
      if(!req.user._json.email) throw new Error("No Email Exist!")
      const User = await UserModel.findOne({ uuid: req.cookies.uuid });
      if(!User) throw new Error("No such User!");
      // Find the Badge
      const badge = User.badges.some(item => item.accountName === req.user.provider)
      if(badge) throw new Error("Badge already exist");
      const userBadges = User.badges;
      const updatedUserBadges = [...userBadges, { accountName: req.user.provider, isVerified: true, type: "default" }]
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

      res.clearCookie("social");
      res.status(200).json({ message: "Successful" });

  } catch (error) {
    res.status(500).json({ message: `An error occurred while addSocialBadge: ${error.message}` });
  }
};

module.exports = {
//   create,
  update,
  getBadges,
  addBadgeSocial
//   getById,
//   getAll,
//   search,
//   remove,
}