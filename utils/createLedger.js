const Ledgers = require("../models/Ledgers");


module.exports.createLedger = async (obj) => {
    try {
        const ledger = await new Ledgers({...obj});
        const savedLedger = await ledger.save();
        if(!savedLedger) throw new Error("Ledger Not Created Successfully!");
        return savedLedger;
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: `An error occurred while create Ledger: ${error.message}` });
      }
};


// module.exports = {
//     create,
// }