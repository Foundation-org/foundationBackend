const shortlink = require("shortlink");
const Redeem = require("../models/Redeem");
const UserModel = require("../models/UserModel");
const { createLedger } = require("../utils/createLedger");
const { updateUserBalance, checkUserBalance } = require("../utils/userServices");
const crypto = require("crypto");

const create = async (req, res) => {
  try {
    const { creator,owner, uuid, amount,description,to,expiry,code } = req.body;
    // check owner exist
    const User = await UserModel.findOne({ uuid });
    if (!User) throw new Error("No such User!");
    
    // check user balance
    const userBalance = await checkUserBalance({ uuid: req.body.uuid, res });
    if (parseInt(userBalance) <= parseInt(amount))
    throw new Error("The balance is insufficient to create this redemption!");
      // Create Ledger
      await createLedger({
        uuid: req.body.uuid,
        txUserAction: "createRedeem",
        txID: crypto.randomBytes(11).toString("hex"),
        txAuth: "DAO",
        txFrom: req.body.uuid,
        txTo: "Redemption",
        txAmount: parseInt(amount),
        // txDescription : "User create redemption code"
        type: 'redemption'
      });
      // Decrement the UserBalance
      await updateUserBalance({
        uuid: req.body.uuid,
        amount: parseInt(amount),
        dec: true,
      });
    //   Generate unique code
    req.body.code = shortlink.generate(10)
    // convert into integer
    req.body.amount = parseInt(amount);
    const redeem = await new Redeem({ ...req.body });
    const savedRedeem = await redeem.save();
    if (!savedRedeem) throw new Error("Redeem Not Created Successfully!");
    res.status(201).json({ data: savedRedeem });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: `An error occurred while create Redeem: ${error.message}`,
    });
  }
};

const transfer = async (req, res) => {
    try {
      const { uuid, code } = req.body;
      // check receiver account exist
      const User = await UserModel.findOne({ uuid });
      if (!User) throw new Error("No such User!");
        
    //   Fetch the redeem data
        const getRedeem = await Redeem.findOne({ code }).populate("owner", "uuid");
      if (!getRedeem) throw new Error("Code is invalid!");

    //   check the owner
      if(getRedeem.owner.uuid === uuid)
        throw new Error("You're already the owner of this redemption")

    // Create Ledger
        // receiver
        await createLedger({
          uuid: req.body.uuid,
          txUserAction: "receivedRedeem",
          txID: crypto.randomBytes(11).toString("hex"),
          txAuth: "DAO",
          txFrom: getRedeem.owner.uuid,
          txTo: req.body.uuid,
          txAmount: getRedeem.amount,
          // txDescription : "User update redemption code"
          type: 'redemption'
        });
        // Create Ledger
        // sender
        await createLedger({
            uuid: getRedeem.owner.uuid,
            txUserAction: "transferredRedeem",
            txID: crypto.randomBytes(11).toString("hex"),
            txAuth: "DAO",
            txFrom: getRedeem.owner.uuid,
            txTo: req.body.uuid,
            txAmount: getRedeem.amount,
            // txDescription : "User update redemption code"
            type: 'redemption'
          });
        // Decrement the UserBalance
        // await updateUserBalance({
        //   uuid: req.body.uuid,
        //   amount: getRedeem.amount,
        //   inc: true,
        // });
        // Update the Redeem
        getRedeem.code = shortlink.generate(10),
        getRedeem.owner = User._id
        const updatedRedeem = await getRedeem.save();
        if (!updatedRedeem) throw new Error("Redeem Not updated Successfully!");
        res.status(201).json({ data: updatedRedeem });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: `An error occurred while create Redeem: ${error.message}`,
      });
    }
  };

  const getUnredeemedById = async (req, res) => {
    try {
      const { page, limit } = req.query;
      const { _id, uuid } = req.body;
  
      const redeem = await Redeem.find({ creator: _id, owner: _id })
  
      res.status(200).json({
        data: redeem
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: `An error occurred while getUnredeemedById Redeem: ${error.message}`,
      });
    }
  };

  const getRedeemHistoryById = async (req, res) => {
    try {
      const { page, limit } = req.query;
      const { _id, uuid } = req.body;
  
      const redeem = await Redeem.find({ creator: _id, owner: { $ne: _id } })
  
      res.status(200).json({
        data: redeem
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: `An error occurred while getRedeemHistoryById Redeem: ${error.message}`,
      });
    }
  };

// const getById = async (req, res) => {
//   try {
//     const { page, limit } = req.query;
//     const uuid = req.cookies.uuid;
//     const skip = (page - 1) * limit;

//     const redeem = await Redeem.find({ uuid })
//       // .sort({ _id: 1 }) // Adjust the sorting based on your needs
//       .sort(req.query.sort === "newest" ? { _id: -1 } : { _id: 1 }) // Adjust the sorting based on your needs
//       .skip(skip)
//       .limit(parseInt(limit));

//     const totalCount = await Redeem.countDocuments({ uuid });
//     const pageCount = Math.ceil(totalCount / limit);

//     res.status(200).json({
//       data: redeem,
//       pageCount,
//       totalCount,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       message: `An error occurred while getById Redeem: ${error.message}`,
//     });
//   }
// };

const getAll = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const skip = (page - 1) * limit;

    const redeem = await Redeem.find({})
      .sort(req.query.sort === "newest" ? { _id: 1 } : { _id: -1 }) // Adjust the sorting based on your needs
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await Redeem.countDocuments();
    const pageCount = Math.ceil(totalCount / limit);

    res.status(200).json({
      data: redeem,
      pageCount,
      totalCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: ` An error occurred while getAll Redeem: ${error.message}`,
    });
  }
};

// const search = async (req, res) => {
//   try {
//     const { page, limit, sort, term } = req.body.params;
//     const skip = (page - 1) * limit;
//     const searchTerm = term || "";

//     const redeem = await Redeem.find({
//       $or: [
//         { txUserAction: { $regex: searchTerm, $options: "i" } },
//         { txID: { $regex: searchTerm, $options: "i" } },
//         { txData: { $regex: searchTerm, $options: "i" } },
//       ],
//     })
//       .sort(sort === "newest" ? { _id: 1 } : { _id: -1 })
//       .skip(skip)
//       .limit(parseInt(limit));

//     const totalCount = await Redeem.countDocuments({
//       $or: [
//         { txUserAction: { $regex: searchTerm, $options: "i" } },
//         { txID: { $regex: searchTerm, $options: "i" } },
//         { txData: { $regex: searchTerm, $options: "i" } },
//       ],
//     });
//     const pageCount = Math.ceil(totalCount / limit);
//     console.log(pageCount);
//     console.log(totalCount);

//     res.status(200).json({
//       data: redeem,
//       pageCount,
//       totalCount,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       message: ` An error occurred while search Redeem: ${error.message}`,
//     });
//   }
// };

// const remove = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const redeem = Redeem.findByIdAndDelete(id);
//     res.status(200).json({ data: redeem });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       message: `An error occurred while remove Redeem: ${error.message}`,
//     });
//   }
// };

module.exports = {
  create,
  transfer,
  getUnredeemedById,
  getRedeemHistoryById,
};
