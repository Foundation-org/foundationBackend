const Ledgers = require("../models/Ledgers");


const create = async (req, res) => {
    try {
        const ledger = await new Ledgers({...req.body});
        const savedLedger = await ledger.save();
        if(!savedLedger) throw new Error("Ledger Not Created Successfully!");
        res.status(201).json({ data: savedLedger });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: `An error occurred while create Ledger: ${error.message}` });
      }
    };


    // const update = async (req, res) => {
    //     try {
    //         const { id } = req.params;
    //         const course = await Ledger.findByPk(id);
    //         if(!course) throw new Error("No such Ledger!");
    //         await course.update(req.body);
    //         res.status(200).json({ data: course });
    
    //     } catch (error) {
    //       console.error(error);
    //       res.status(500).json({ message: `An error occurred while update Ledger: ${error.message}` });
    //     }
    //   };
    
    
    //   const getById = async (req, res) => {
    //     try {
    //         const { id } = req.params;
    //         const course = await Ledger.findByPk(id);
    //         if(!course) throw new Error("No such Ledger!");
    //         res.status(200).json({ data: course });
          
    //     } catch (error) {
    //       console.error(error);
    //       res.status(500).json({ message: `An error occurred while getById Ledger: ${error.message}` });
    //     }
    //   };
    
    
    //   const getAll = async (req, res) => {
    //     try {
    //         const course = await Ledger.findAll({ order: [['id', 'ASC']] });
    //         if(!course) throw new Error("No such Ledger!");
    //         res.status(200).json({ data: course });
    //     } catch (error) {
    //       console.error(error);
    //       res.status(500).json({ message: `An error occurred while getAll Ledger: ${error.message}` });
    //     }
    //   };
    
    
    const remove = async (req, res) => {
    try {
        const { id } = req.params;
        const ledger = Ledgers.findByIdAndDelete(id)
        res.status(200).json({ data: ledger });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: `An error occurred while remove Ledger: ${error.message}` });
    }
    };


module.exports = {
    create,
    // update,
    // getById,
    // getAll,
    remove,
}