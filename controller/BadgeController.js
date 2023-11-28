const UserModel = require("../models/UserModel");


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
        const { userId: id, badgeId } = req.params;
        const User = await UserModel.findByPk(id);
        if(!User) throw new Error("No such User!");
        // Find the Badge
        const userBadges = User.badges;
        const updatedUserBadges = userBadges.map(item => {
            if(item._id === parseInt(badgeId)){
                return item.type = req.body.type;
            };
        })
        // Update the user badges
        User.badges = updatedUserBadges;
        await User.save();
        res.status(200).json({ data: User });

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
//   getById,
//   getAll,
//   search,
//   remove,
}