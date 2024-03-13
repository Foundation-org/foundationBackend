const UserQuestSetting = require("../models/UserQuestSetting");
const shortLink = require("shortlink");
const { createLedger } = require("../utils/createLedger");
const crypto = require("crypto");
const UserModel = require("../models/UserModel");
const InfoQuestQuestions = require("../models/InfoQuestQuestions");
const AWS = require('aws-sdk');
const { uploadS3Bucket } = require("../utils/uploadS3Bucket");

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

const link = async (req, res) => {
  try {
    const payload = req.body;

    // if uniqueLink
    if (payload.isGenerateLink) {
      await ledgerEntryPostLinkCreated(payload.uuid);
      payload.link = shortLink.generate(8);
    }

    // To check the Question Description
    const infoQuestQuestion = await InfoQuestQuestions.findOne({
      _id: payload.questForeignKey,
    });

    const userQuestSettingExist = await UserQuestSetting.findOne({
      uuid: payload.uuid,
      questForeignKey: payload.questForeignKey,
    });

    let savedOrUpdatedUserQuestSetting;
    // To check the record exist
    if (userQuestSettingExist) {
      savedOrUpdatedUserQuestSetting = await UserQuestSetting.findOneAndUpdate(
        {
          uuid: payload.uuid,
          questForeignKey: payload.questForeignKey,
        },
        {
          // Update fields and values here
          $set: payload,
        },
        {
          new: true, // Return the modified document rather than the original
        }
      );
      await uploadS3Bucket({ fileName: savedOrUpdatedUserQuestSetting.link, description: savedOrUpdatedUserQuestSetting.Question })
    } else {
      // Create a short link
      const userQuestSetting = new UserQuestSetting({
        ...payload,
      });
      savedOrUpdatedUserQuestSetting = await userQuestSetting.save();
      await uploadS3Bucket({ fileName: savedOrUpdatedUserQuestSetting.link, description: savedOrUpdatedUserQuestSetting.Question })
    };
    
    return res
      .status(201)
      .json({ message: "UserQuestSetting link Created Successfully!", data: savedOrUpdatedUserQuestSetting });

  } catch(error){
    console.error(error);
    res.status(500).json({
      message: ` An error occurred while create UserQuestSetting link: ${error.message}`,
    });
  }
};

const impression = async (req, res) => {
  try {
    const { link } = req.params;

    // Update the document using findOneAndUpdate with $inc operator
    const updatedUserQuestSetting = await UserQuestSetting.findOneAndUpdate(
      { link, linkStatus:"Enable" },
      { $inc: { questImpression: 1 } }, // Increment questImpression field by 1
      { new: true } // Return the updated document
    );

    if (!updatedUserQuestSetting) {
      // If the document doesn't exist, you may want to handle this case
      return res.status(404).json({ message: "UserQuestSetting not found" });
    }

    return res.status(201).json({
      message: "UserQuestSetting link Updated Successfully!",
      data: updatedUserQuestSetting,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: `An error occurred while updating UserQuestSetting link: ${error.message}`,
    });
  }
};

const status = async (req, res) => {
  try {
    const { link } = req.params;
    const { status } = req.body;
    let updatedUserQuestSetting;

    if (status === 'Delete') {
      updatedUserQuestSetting = await UserQuestSetting.findOneAndDelete({ link }).exec();
      if (!updatedUserQuestSetting) {
        return res.status(404).json({ message: "Share link not found or already deleted" });
      }
      return res.status(200).json({ message: "Share link Deleted Successfully" });
    } else {
      updatedUserQuestSetting = await UserQuestSetting.findOneAndUpdate(
        { link },
        { linkStatus: status },
        { new: true }
      );
      if (!updatedUserQuestSetting) {
        return res.status(404).json({ message: "Share link not found" });
      }
      return res.status(200).json({
        message: `Share link ${status === 'Disable' ? 'Disabled' : 'Enabled'} Successfully`,
        data: updatedUserQuestSetting,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: `An error occurred while changing link status: ${error.message}`,
    });
  }
};

const create = async (req, res) => {
  try {
    const payload = req.body;

    // if uniqueLink
    // if(payload.linkStatus === "Enable"){
    //   await ledgerEntryPostLinkCreated(payload.uuid);
    //   payload.link = shortLink.generate(8);
    // }

    const userQuestSettingExist = await UserQuestSetting.findOne({
      uuid: payload.uuid,
      questForeignKey: payload.questForeignKey,
    });
    // To check the record exist
    if (userQuestSettingExist)
      throw new Error("userQuestSetting already exist");

    // Create a short link
    const userQuestSetting = new UserQuestSetting({
      ...payload,
    });
    const savedUserQuestSetting = await userQuestSetting.save();
    // Get quest owner uuid
    const infoQuestQuestion = await InfoQuestQuestions.findOne({
      _id: payload.questForeignKey,
    });
    // if hidden
    if (payload.hidden) {
      await hiddenPostCount(infoQuestQuestion.uuid, true);
      await ledgerEntryAdded(payload.uuid, infoQuestQuestion.uuid);
    }

    return res.status(201).json({
      message: "UserQuestSetting Created Successfully!",
      data: savedUserQuestSetting,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: ` An error occurred while create UserQuestSetting: ${error.message}`,
    });
  }
};

const update = async (req, res) => {
  try {
    const payload = req.body;

    const userQuestSettingExist = await UserQuestSetting.findOne({
      uuid: payload.uuid,
      questForeignKey: payload.questForeignKey,
    });
    // To check the record exist
    if (!userQuestSettingExist) throw new Error("userQuestSetting not exist");

    // if uniqueLink
    // if(payload.uniqueLink){
    //   await ledgerEntryPostLinkCreated(payload.uuid);
    //   payload.link = shortLink.generate(8);
    // }
    // If the record exists, update it
    const updatedUserQuestSetting = await UserQuestSetting.findOneAndUpdate(
      {
        uuid: payload.uuid,
        questForeignKey: payload.questForeignKey,
      },
      {
        // Update fields and values here
        $set: payload,
      },
      {
        new: true, // Return the modified document rather than the original
      }
    );
    // Get quest owner uuid
    const infoQuestQuestion = await InfoQuestQuestions.findOne({
      _id: payload.questForeignKey,
    });
    // if hidden
    if (payload.hidden) {
      await hiddenPostCount(infoQuestQuestion.uuid, true);
      await ledgerEntryAdded(payload.uuid, infoQuestQuestion.uuid);
    } else if (payload.hidden === false) {
      await hiddenPostCount(infoQuestQuestion.uuid, false);
      await ledgerEntryRemoved(payload.uuid, infoQuestQuestion.uuid);
    }
    return res.status(201).json({
      message: "UserQuestSetting Updated Successfully!",
      data: updatedUserQuestSetting,
    });
  } catch (error) {
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

const hiddenPostCount = async (uuid, hidden) => {
  try {
    // increment
    await UserModel.updateOne(
      { uuid },
      { $inc: { yourHiddenPostCounter: hidden ? 1 : -1 } }
    );
  } catch (error) {
    console.error(error);
  }
};

const ledgerEntryPostLinkCreated = async (uuid) => {
  try {
    // User
    await createLedger({
      uuid: uuid,
      txUserAction: "postLinkCreated",
      txID: crypto.randomBytes(11).toString("hex"),
      txAuth: "User",
      txFrom: uuid,
      txTo: "dao",
      txAmount: "0",
      txData: uuid,
      // txDescription : "User creates a new account"
    });
  } catch (error) {
    console.error(error);
  }
};

const ledgerEntryAdded = async (uuid, questOwnerUuid) => {
  try {
    // User
    await createLedger({
      uuid: uuid,
      txUserAction: "postHiddenAdded",
      txID: crypto.randomBytes(11).toString("hex"),
      txAuth: "DAO",
      txFrom: "dao",
      txTo: uuid,
      txAmount: "0",
      txData: uuid,
      // txDescription : "User creates a new account"
    });
    await createLedger({
      uuid: questOwnerUuid,
      txUserAction: "postHiddenAddedUser",
      txID: crypto.randomBytes(11).toString("hex"),
      txAuth: "User",
      txFrom: questOwnerUuid,
      txTo: "dao",
      txAmount: "0",
      txData: questOwnerUuid,
      // txDescription : "User creates a new account"
    });
  } catch (error) {
    console.error(error);
  }
};

const ledgerEntryRemoved = async (uuid, questOwnerUuid) => {
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
      txUserAction: "postHiddenRemovedUser",
      txID: crypto.randomBytes(11).toString("hex"),
      txAuth: "User",
      txFrom: questOwnerUuid,
      txTo: "dao",
      txAmount: "0",
      txData: questOwnerUuid,
      // txDescription : "User creates a new account"
    });
  } catch (error) {
    console.error(error);
  }
};

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
  link,
  impression,
  status,
  // get,
};
