const Ledgers = require("../models/Ledgers");
const Users = require("../models/UserModel");

const create = async (req, res) => {
  try {
    const ledger = await new Ledgers({ ...req.body });
    const savedLedger = await ledger.save();
    if (!savedLedger) throw new Error("Ledger Not Created Successfully!");
    res.status(201).json({ data: savedLedger });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: `An error occurred while create Ledger: ${error.message}`,
    });
  }
};

const getById = async (req, res) => {
  try {
    const { page, limit, txAuth } = req.query;
    const uuid = req.cookies.uuid || req.body.uuid;
    // filter Object
    const filterObj = {};
    if(txAuth){
      filterObj.txAuth = txAuth;
      filterObj.$or = [
        { txFrom: { $regex: "DAO Treasury", $options: "i" } }, // Case-insensitive match for txFrom
        { txTo: { $regex: "DAO Treasury", $options: "i" } }    // Case-insensitive match for txTo
      ]
    } else {
      filterObj.uuid = uuid
    }
    const skip = (page - 1) * limit;

    const ledger = await Ledgers.find(filterObj)
      // .sort({ _id: 1 }) // Adjust the sorting based on your needs
      .sort(req.query.sort === "newest" ? { _id: -1 } : { _id: 1 }) // Adjust the sorting based on your needs
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await Ledgers.countDocuments(filterObj);
    const pageCount = Math.ceil(totalCount / limit);

    res.status(200).json({
      data: ledger,
      pageCount,
      totalCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: `An error occurred while getById Ledger: ${error.message}`,
    });
  }
};

const getAll = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const skip = (page - 1) * limit;

    const ledger = await Ledgers.find({})
      .sort(req.query.sort === "newest" ? { _id: 1 } : { _id: -1 }) // Adjust the sorting based on your needs
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await Ledgers.countDocuments();
    const pageCount = Math.ceil(totalCount / limit);

    res.status(200).json({
      data: ledger,
      pageCount,
      totalCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: ` An error occurred while getAll Ledger: ${error.message}`,
    });
  }
};

const search = async (req, res) => {
  try {
    const { page, limit, sort, term, type, uuid } = req.body.params;
    const skip = (page - 1) * limit;
    const searchTerm = term || "";

    const ledger = await Ledgers.find({
      type,
      uuid,
      $or: [
        { txUserAction: { $regex: searchTerm, $options: "i" } },
        { txID: { $regex: searchTerm, $options: "i" } },
        { txData: { $regex: searchTerm, $options: "i" } },
      ],
    })
      .sort(sort === "newest" ? { _id: 1 } : { _id: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await Ledgers.countDocuments({
      type,
      uuid,
      $or: [
        { txUserAction: { $regex: searchTerm, $options: "i" } },
        { txID: { $regex: searchTerm, $options: "i" } },
        { txData: { $regex: searchTerm, $options: "i" } },
      ],
    });
    const pageCount = Math.ceil(totalCount / limit);
    console.log(pageCount);
    console.log(totalCount);

    res.status(200).json({
      data: ledger,
      pageCount,
      totalCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: ` An error occurred while search Ledger: ${error.message}`,
    });
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const ledger = Ledgers.findByIdAndDelete(id);
    res.status(200).json({ data: ledger });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: `An error occurred while remove Ledger: ${error.message}`,
    });
  }
};

const getLastUserActionTime = async (req, res) => {
  const userUUID = req.query.uuid; // Assuming user UUID is passed as a route parameter

  try {
      // Query the ledger collection to find the last record for the given user UUID
      const lastRecord = await Ledgers.findOne({ uuid: userUUID }, { updatedAt: 1, _id: 0 }).sort({ updatedAt: -1 }).exec();

      if (lastRecord) {
          // If a record is found, send it as a response
          res.json({ lastUserActionTime: lastRecord.updatedAt });
      } else {
          // If no record is found for the provided UUID, send an appropriate message
          res.status(404).json({ message: 'No record found for the provided user UUID' });
      }
  } catch (error) {
      // If an error occurs during the database query, send an error response
      console.error('Error occurred while fetching last user action:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
};

const getLastActiveTimesForAllUsers = async (req, res) => {
  try {
      // Fetch all records
      const allRecords = await Ledgers.find({}, { uuid: 1, updatedAt: 1 }).sort({ updatedAt: -1 });

      // Create a map to store the latest activity time for each UUID
      const latestActivityMap = new Map();

      // Iterate through all records to find the latest activity time for each UUID
      allRecords.forEach(record => {
          const { uuid, updatedAt } = record;
          if (!latestActivityMap.has(uuid) || updatedAt > latestActivityMap.get(uuid)) {
              latestActivityMap.set(uuid, updatedAt);
          }
      });

      // Calculate the date 7 days ago
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Filter UUIDs where the latest activity is more than 7 days ago
      const filteredUUIDs = Array.from(latestActivityMap.entries())
          .filter(([uuid, updatedAt]) => updatedAt <= sevenDaysAgo)
          .map(([uuid, updatedAt]) => ({ uuid, lastActiveTime: updatedAt }));

      if (filteredUUIDs.length > 0) {
          // If records are found, send them as a response
          res.json({ lastActiveTimes: filteredUUIDs });
      } else {
          // If no records are found, send an appropriate message
          res.status(404).json({ message: 'No records found where 7 days have passed since last activity' });
      }
  } catch (error) {
      // If an error occurs during the database query, send an error response
      console.error('Error occurred while fetching last active times for all users:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
};

const getLstActAndEmailForAllUsers = async (req, res) => {
    try {
        // Fetch all records
        const allRecords = await Ledgers.find({}, { uuid: 1, updatedAt: 1 }).sort({ updatedAt: -1 });

        // Create a map to store the latest activity time for each UUID
        const latestActivityMap = new Map();

        // Iterate through all records to find the latest activity time for each UUID
        allRecords.forEach(record => {
            const { uuid, updatedAt } = record;
            if (!latestActivityMap.has(uuid) || updatedAt > latestActivityMap.get(uuid)) {
                latestActivityMap.set(uuid, updatedAt);
            }
        });

        // Calculate the date 7 days ago
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // Filter UUIDs where the latest activity is more than 7 days ago
        let filteredUUIDs = Array.from(latestActivityMap.entries())
            .filter(([uuid, updatedAt]) => updatedAt <= sevenDaysAgo)
            .map(([uuid, updatedAt]) => ({ uuid, lastActiveTime: updatedAt }));

        // Fetch user emails from the users table
        const usersWithEmails = await Users.find({ uuid: { $in: filteredUUIDs.map(item => item.uuid) } }, { uuid: 1, email: 1 });

        // Create a map to store email for each UUID
        const uuidToEmailMap = new Map(usersWithEmails.map(user => [user.uuid, user.email]));

        // Filter out objects where email is not found or contains '@guest.com'
        filteredUUIDs = filteredUUIDs.filter(item => {
            const email = uuidToEmailMap.get(item.uuid);
            return email && !email.includes('@guest.com');
        });

        if (filteredUUIDs.length > 0) {
            // If records are found, append emails and send them as a response
            filteredUUIDs.forEach(item => {
                item.email = uuidToEmailMap.get(item.uuid);
            });
            res.json({ lastActiveTimes: filteredUUIDs });
        } else {
            // If no records are found, send an appropriate message
            res.status(404).json({ message: 'No records found where 7 days have passed since last activity' });
        }
    } catch (error) {
        // If an error occurs during the database query, send an error response
        console.error('Error occurred while fetching last active times for all users:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};






module.exports = {
  create,
  getById,
  getAll,
  search,
  remove,
  getLastUserActionTime,
  getLastActiveTimesForAllUsers,
  getLstActAndEmailForAllUsers
};
