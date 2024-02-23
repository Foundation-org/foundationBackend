const UserQuestSetting = require("../models/UserQuestSetting");
const shortLink = require("shortlink");
const { createLedger } = require("../utils/createLedger");
const crypto = require("crypto");
const UserModel = require("../models/UserModel");


const createOrUpdate = async (req, res) => {
  try {
    const payload = {
      userId: "65c62e494dbb143f31639a34",
      questId: "65c62e5d4dbb143f31639a5e",
      hidden: true,
      generateLink: true,
    };
    // const payload = req.body;

    // To check the record exist
    const userQuestSettingExist = await UserQuestSetting.findOne({
      userId,
      questId,
    });
    // To Create
    if (!userQuestSettingExist) {
      // create
      // UserQuestSetting.create({ userId, questId, hidden });
      // return res.status(201).json({ message: "UserQuestSetting Created Successfully!" }); const userQuestSetting = new UserQuestSetting({ userId, questId, hidden });
      const userQuestSetting = new UserQuestSetting({
        userId,
        questId,
        ...settingField,
      });
      const savedUserQuestSetting = await userQuestSetting.save();
      return res
        .status(201)
        .json({ message: "UserQuestSetting Created Successfully!" });
    } else {
      // update
      UserQuestSetting.updateOne({ userId, questId, ...settingField });
      return res
        .status(200)
        .json({ message: "UserQuestSetting Updated Successfully!" });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: ` An error occurred while createOrUpdate UserQuestSetting: ${error.message}`,
    });
  }
};

const create = async(req, res) => {
  try {
    const payload = req.body;

    const userQuestSettingExist = await UserQuestSetting.findOne({
      uuid: payload.uuid,
      questForeignKey: payload.questForeignKey,
    });
    // To check the record exist
    if (userQuestSettingExist) throw new Error("userQuestSetting already exist");

    // Create a short link
    const userQuestSetting = new UserQuestSetting({
      ...payload,
      link: shortLink.generate(8)
    });
    const savedUserQuestSetting = await userQuestSetting.save();
    // if hidden
    if (payload.hidden) {
      await hiddenPostCount(payload.uuid, true);
      await ledgerEntryAdded(payload.uuid, payload.questOwnerUuid);
    } else {
      await hiddenPostCount(payload.uuid, false);
      await ledgerEntryRemoved(payload.uuid, payload.questOwnerUuid);
    }
    return res
      .status(201)
      .json({ message: "UserQuestSetting Created Successfully!", data: savedUserQuestSetting });

  } catch(error){
    console.error(error);
    res.status(500).json({
      message: ` An error occurred while create UserQuestSetting: ${error.message}`,
    });
  }
}

const update = async (req, res) => {
  try {
    const payload = req.body;

    const userQuestSettingExist = await UserQuestSetting.findOne({
      uuid: payload.uuid,
      questForeignKey: payload.questForeignKey,
    });
    // To check the record exist
    if (!userQuestSettingExist) throw new Error("userQuestSetting not exist");

    // If the record exists, update it
    const updatedUserQuestSetting = await UserQuestSetting.findOneAndUpdate(
      {
        uuid: payload.uuid,
        questForeignKey: payload.questForeignKey,
      },
      {
        // Update fields and values here
        $set: payload
      },
      {
        new: true, // Return the modified document rather than the original
      }
    );
    // if hidden
    if (payload.hidden) {
      await hiddenPostCount(payload.uuid, true);
      await ledgerEntryAdded(payload.uuid, payload.questOwnerUuid);
    } else {
      await hiddenPostCount(payload.uuid, false);
      await ledgerEntryRemoved(payload.uuid, payload.questOwnerUuid);
    }
    return res
      .status(201)
      .json({ message: "UserQuestSetting Updated Successfully!", data: updatedUserQuestSetting });

  } catch(error){
    console.error(error);
    res.status(500).json({
      message: ` An error occurred while update UserQuestSetting: ${error.message}`,
    });
  }
};

const getAllHiddenQuestions = async (req, res) => {
  try {
    const { uuid, _page, _limit } = req.body;
    const page = parseInt(_page);
    const pageSize = parseInt(_limit);

    // Calculate the number of documents to skip to get to the desired page
    const skip = (page - 1) * pageSize;
    let filterObj = { uuid: uuid };

    if (req.body.type) {
      filterObj.whichTypeQuestion = req.body.type;
    }
    if (req.body.filter === true) {
      filterObj.createdBy = req.cookies.uuid;
    }

    const Questions = await BookmarkQuests.find(filterObj)
      .sort(req.body.sort === "Newest First" ? { createdAt: -1 } : "createdAt")
      .skip(skip)
      .limit(pageSize);

    const mapPromises = Questions.map(async function (record) {
      return InfoQuestQuestions.findOne({
        _id: record.questForeignKey,
      });
    });

    const response = await Promise.all(mapPromises);
    res.status(200).json(response);
  } catch (err) {
    res.status(500).send(err);
  }
};

const getAllHiddenQuests = async (req, res) => {
  try {
    const Questions = await BookmarkQuests.find({
      uuid: req.cookies.uuid,
    });
    // console.log(Questions);
    res.status(200).json(Questions);
  } catch (err) {
    res.status(500).send(err);
  }
};

const hiddenPostCount = async(uuid, hidden) => {
  try {
    // increment
    await UserModel.updateOne(
      { uuid },
      { $inc: { yourHiddenPostCounter: hidden ? 1 : -1 } }
    );
    
  } catch(error) {
    console.error(error);
  }
}

const ledgerEntryAdded = async(uuid, questOwnerUuid) => {
  try {
    // User
    await createLedger({
     uuid: uuid,
     txUserAction: "postHiddenAdded",
     txID: crypto.randomBytes(11).toString("hex"),
     txAuth: "User",
     txFrom: uuid,
     txTo: "dao",
     txAmount: "0",
     txData: uuid,
     // txDescription : "User creates a new account"
   });
   await createLedger({
    uuid: questOwnerUuid,
    txUserAction: "postHiddenAdded",
    txID: crypto.randomBytes(11).toString("hex"),
    txAuth: "User",
    txFrom: questOwnerUuid,
    txTo: "dao",
    txAmount: "0",
    txData: questOwnerUuid,
    // txDescription : "User creates a new account"
  });
  } catch(error) {
    console.error(error);
  }
}

const ledgerEntryRemoved = async(uuid, questOwnerUuid) => {
  try {
    // User
    await createLedger({
     uuid: uuid,
     txUserAction: "postHiddenRemoved",
     txID: crypto.randomBytes(11).toString("hex"),
     txAuth: "User",
     txFrom: uuid,
     txTo: "dao",
     txAmount: "0",
     txData: uuid,
     // txDescription : "User creates a new account"
   });
   await createLedger({
    uuid: questOwnerUuid,
    txUserAction: "postHiddenRemoved",
    txID: crypto.randomBytes(11).toString("hex"),
    txAuth: "User",
    txFrom: questOwnerUuid,
    txTo: "dao",
    txAmount: "0",
    txData: questOwnerUuid,
    // txDescription : "User creates a new account"
  });
  } catch(error) {
    console.error(error);
  }
}


// const get = async (req, res) => {
//   try {
//     const getTreasury = await Treasury.findOne();
//     res.status(200).json({
//       data: getTreasury?.amount?.toString(),
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       message: ` An error occurred while get Treasury: ${error.message}`,
//     });
//   }
// };

module.exports = {
  create,
  createOrUpdate,
  update,
  // get,
};
