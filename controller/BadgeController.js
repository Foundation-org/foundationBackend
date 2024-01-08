const UserModel = require("../models/UserModel");
const { createToken } = require("../service/auth");


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


module.exports = {
//   create,
  update,
  getBadges,
//   getById,
//   getAll,
//   search,
//   remove,
}