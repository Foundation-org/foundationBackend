const Treasury = require("../models/Treasury");

const create = async(req, res) => {
    try {
        const { amount } = req.query;
        const treasuryEntry = new Treasury({ amount });
        const savedTreasury = await treasuryEntry.save();
        if (!savedTreasury) throw new Error("Treasury Not Created Successfully!");
        res.status(201).json({ data: savedTreasury });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: `An error occurred while create Treasury: ${error.message}` });
      }
}

// const create = async (req, res) => {
//   try {
//     const ledger = await new Ledgers({ ...req.body });
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
      const { amount } = req.query;
      const treasury = await Treasury.updateOne({ $set: { amount } });
      if(!treasury) throw new Error("No such Treasury!");
      res.status(200).json({ data: treasury.modifiedCount });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `An error occurred while update Ledger: ${error.message}` });
  }
};


// const getById = async (req, res) => {
//   try {
//     const { page, limit, uuid } = req.query;
//     const skip = (page - 1) * limit;

//     const ledger = await Ledgers.find({ uuid })
//       .sort({ _id: 1 }) // Adjust the sorting based on your needs
//       .skip(skip)
//       .limit(parseInt(limit));

//     const totalCount = await Ledgers.countDocuments({ uuid });
//     const pageCount = Math.ceil(totalCount / limit);

//     res.status(200).json({
//       data: ledger,
//       pageCount,
//       totalCount,
//     });
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({
//         message: `An error occurred while getById Ledger: ${error.message}`,
//       });
//   }
// };


const get = async (req, res) => {
  try {
    const getTreasury = await Treasury.findOne();
    res.status(200).json({
      data2: getTreasury.amount.toString(),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({message: ` An error occurred while get Treasury: ${error.message}`});
  }
};

// const search = async (req, res) => {
//   try {
//     const { page, limit,sort,term } = req.body.params;
//     const skip = (page - 1) * limit;
//     const searchTerm = term || '';

//     const ledger = await Ledgers.find({
//       $or: [
//         { txUserAction: { $regex: searchTerm, $options: "i" } }, 
//         { txID: { $regex: searchTerm, $options: "i" } }, 
//         { txData: { $regex: searchTerm, $options: "i" } },
//       ]
//     }).sort(sort==="newest"?{_id:1}:{_id:-1})
//       .skip(skip)
//       .limit(parseInt(limit));

//       const totalCount = await Ledgers.countDocuments({
//         $or: [
//           { txUserAction: { $regex: searchTerm, $options: "i" } }, 
//           { txID: { $regex: searchTerm, $options: "i" } }, 
//           { txData: { $regex: searchTerm, $options: "i" } },
//         ]
//       });
//     const pageCount = Math.ceil(totalCount / limit);
//     console.log(pageCount);
//     console.log(totalCount);

//     res.status(200).json({
//       data: ledger,
//       pageCount,
//       totalCount,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       message: ` An error occurred while search Ledger: ${error.message}`,
//     });
//   }
// };





// const remove = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const ledger = Ledgers.findByIdAndDelete(id)
//     res.status(200).json({ data: ledger });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: `An error occurred while remove Ledger: ${error.message}` });
//   }
// };


module.exports = {
  create,
  update,
//   getById,
  get,
//   search,
//   remove,
}