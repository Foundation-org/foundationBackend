const UserQuestSetting = require("../models/UserQuestSetting");
const shortLink = require("shortlink");

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
      userId: payload.userId,
      questId: payload.questId,
    });
    // To check the record exist
    if (userQuestSettingExist) throw new Error("userQuestSetting already exist");

    const userQuestSetting = new UserQuestSetting({
      ...payload
    });
    const savedUserQuestSetting = await userQuestSetting.save();
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
      userId: payload.userId,
      questId: payload.questId,
    });
    // To check the record exist
    if (!userQuestSettingExist) throw new Error("userQuestSetting not exist");

    // If the record exists, update it
    const updatedUserQuestSetting = await UserQuestSetting.findOneAndUpdate(
      {
        userId: payload.userId,
        questId: payload.questId,
      },
      {
        // Update fields and values here
        $set: payload
      },
      {
        new: true, // Return the modified document rather than the original
      }
    );
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
