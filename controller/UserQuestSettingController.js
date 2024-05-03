const UserQuestSetting = require("../models/UserQuestSetting");
const shortLink = require("shortlink");
const { createLedger } = require("../utils/createLedger");
const crypto = require("crypto");
const UserModel = require("../models/UserModel");
const InfoQuestQuestions = require("../models/InfoQuestQuestions");
const AWS = require("aws-sdk");
const { uploadS3Bucket } = require("../utils/uploadS3Bucket");
const path = require("path");
const { s3ImageUpload } = require("../utils/uploadS3Bucket");
const fs = require("fs");
const nodeHtmlToImage = require("node-html-to-image");

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
      await uploadS3Bucket({
        fileName: savedOrUpdatedUserQuestSetting.link,
        description: savedOrUpdatedUserQuestSetting.Question,
      });
    } else {
      // Create a short link
      const userQuestSetting = new UserQuestSetting({
        ...payload,
      });
      savedOrUpdatedUserQuestSetting = await userQuestSetting.save();
      await uploadS3Bucket({
        fileName: savedOrUpdatedUserQuestSetting.link,
        description: savedOrUpdatedUserQuestSetting.Question,
      });
    }

    return res.status(201).json({
      message: "UserQuestSetting link Created Successfully!",
      data: savedOrUpdatedUserQuestSetting,
    });
  } catch (error) {
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
      { link, linkStatus: "Enable" },
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
    if (status === "Delete") {
      updatedUserQuestSetting = await UserQuestSetting.findOneAndUpdate(
        { link },
        {
          linkStatus: status,
          link: "",
          questImpression: 0,
          questsCompleted: 0,
          $unset: { result: "" }, // This removes the "result" field from the document
        },
        { new: true }
      );
    } else {
      updatedUserQuestSetting = await UserQuestSetting.findOneAndUpdate(
        { link },
        { linkStatus: status },
        { new: true }
      );
    }
    if (!updatedUserQuestSetting) {
      return res.status(404).json({ message: "Share link not found" });
    }
    return res.status(200).json({
      message: `Share link ${
        status === "Disable"
          ? "Disabled"
          : status === "Delete"
          ? "Deleted"
          : "Enabled"
      } Successfully`,
      data: updatedUserQuestSetting,
    });
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

    // const userQuestSettingExist = await UserQuestSetting.findOne({
    //   uuid: payload.uuid,
    //   questForeignKey: payload.questForeignKey,
    // });

    let updateData = {
      $set: { ...payload }, // Base the update object on the incoming payload
    };

    // Add 'hiddenTime' conditionally
    if (payload.hidden === true) {
      updateData.$set.hiddenTime = new Date(); // Set to the current timestamp
    }
    console.log(updateData);
    let userQuestSettingSaved;
    userQuestSettingSaved = await UserQuestSetting.findOneAndUpdate(
      // Query criteria
      { uuid: payload.uuid, questForeignKey: payload.questForeignKey },
      // Update or insert payload
      updateData,
      // Options
      { new: true, upsert: true }
    );
    const userQuestSettingExist = await UserQuestSetting.findOne({
      uuid: payload.uuid,
      questForeignKey: payload.questForeignKey,
    });
    // To check the record exist
    if (!userQuestSettingExist) throw new Error("userQuestSetting not exist");

    if (userQuestSettingExist && payload.hidden === true) {
      // Document found, update hiddenTime and save
      userQuestSettingExist.hiddenTime = new Date();
      await userQuestSettingExist.save();
    }

    // To check the record exist
    // if (userQuestSettingExist){
    //    // If the record exists, update it
    //    userQuestSettingSaved = await UserQuestSetting.findOneAndUpdate(
    //     {
    //       uuid: payload.uuid,
    //       questForeignKey: payload.questForeignKey,
    //     },
    //     {
    //       // Update fields and values here
    //       $set: payload,
    //     },
    //     {
    //       new: true, // Return the modified document rather than the original
    //     }
    //   );
    // } else {
    //   // Create
    //   const userQuestSetting = new UserQuestSetting({
    //     ...payload,
    //   });
    //   userQuestSettingSaved = await userQuestSetting.save();
    // }

    // Get quest owner uuid
    const infoQuestQuestion = await InfoQuestQuestions.findOne({
      _id: payload.questForeignKey,
    });
    // if hidden
    if (payload.hidden) {
      await hiddenPostCount(infoQuestQuestion.uuid, true);
      await ledgerEntryAdded(payload.uuid, infoQuestQuestion.uuid);

      const suppression = await UserQuestSetting.aggregate([
        {
          $match: {
            hidden: true,
            questForeignKey: payload.questForeignKey,
          },
        },
        {
          $group: {
            _id: "$hiddenMessage",
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 1,
            count: 1,
            exceedsLimit: { $gte: ["$count", 5] },
          },
        },
        {
          $match: {
            exceedsLimit: true,
          },
        },
      ]);

      // Checking if suppression array has any elements to avoid errors
      const suppressionExists = suppression.length > 0;

      // Get the first suppression if it exists (assumes only one result)
      const firstSuppression = suppressionExists ? suppression[0] : null;

      // The suppressed status depends on whether we have a suppression and if it meets the limit
      const suppressed = suppressionExists;
      const suppressedReason = firstSuppression ? firstSuppression._id : "";

      // Properly setting the fields to update with $set
      const resp = await InfoQuestQuestions.findOneAndUpdate(
        { _id: payload.questForeignKey },
        {
          $set: {
            suppressed,
            suppressedReason,
          },
        },
        { new: true } // Optionally return the updated document
      );

      console.log("Suppression Response", resp);
    } else if (payload.hidden === false) {
      await hiddenPostCount(infoQuestQuestion.uuid, false);
      await ledgerEntryRemoved(payload.uuid, infoQuestQuestion.uuid);
    }

    return res.status(201).json({
      message: "UserQuestSetting Upsert Successfully!",
      data: userQuestSettingSaved,
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

    if (userQuestSettingExist && payload.hidden === true) {
      // Document found, update hiddenTime and save
      userQuestSettingExist.hiddenTime = new Date();
      await userQuestSettingExist.save();
    }

    // if uniqueLink
    // if(payload.uniqueLink){
    //   await ledgerEntryPostLinkCreated(payload.uuid);
    //   payload.link = shortLink.generate(8);
    // }

    let updateData = {
      $set: { ...payload }, // Base the update object on the incoming payload
    };

    // Add 'hiddenTime' conditionally
    if (payload.hidden === true) {
      updateData.$set.hiddenTime = new Date(); // Set to the current timestamp
    }
    // If the record exists, update it
    const updatedUserQuestSetting = await UserQuestSetting.findOneAndUpdate(
      {
        uuid: payload.uuid,
        questForeignKey: payload.questForeignKey,
      },
      updateData,
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

    //QUERY TO CHECK SUPPRESSION OF post
    const suppression = await UserQuestSetting.aggregate([
      {
        $match: {
          hidden: true,
          questForeignKey: payload.questForeignKey,
        },
      },
      {
        $group: {
          _id: "$hiddenMessage",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 1,
          count: 1,
          exceedsLimit: { $gte: ["$count", 5] },
        },
      },
      {
        $match: {
          exceedsLimit: true,
        },
      },
    ]);

    // Checking if suppression array has any elements to avoid errors
    const suppressionExists = suppression.length > 0;

    // Get the first suppression if it exists (assumes only one result)
    const firstSuppression = suppressionExists ? suppression[0] : null;

    // The suppressed status depends on whether we have a suppression and if it meets the limit
    const suppressed = suppressionExists;
    const suppressedReason = firstSuppression ? firstSuppression._id : "";

    // Properly setting the fields to update with $set
    const resp = await InfoQuestQuestions.findOneAndUpdate(
      { _id: payload.questForeignKey },
      {
        $set: {
          suppressed,
          suppressedReason,
        },
      },
      { new: true } // Optionally return the updated document
    );

    console.log("Suppression Response", resp);

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
      .sort({ createdAt: -1 })
      // .sort(req.body.sort === "Newest First" ? { createdAt: -1 } : "createdAt")
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

const sharedLinkDynamicImage = async (req, res) => {
  try {
    console.log("Req body", req.body);
    const { questStartData, link } = req.body;

    // Generate a image name for the image file
    const imgName = link + ".png";

    nodeHtmlToImage({
      output: `./assets/uploads/images/${imgName}`,
      html: `
  
  <!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body
  class="flex flex-col min-h-screen items-center w-full justify-center gap-[25px]"
>
  <svg
    width="370"
    height="46"
    viewBox="0 0 370 46"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M14.0525 9.95473H18.269C19.5069 9.95473 19.739 10.651 19.739 12.0436C19.739 13.4362 19.5069 14.1325 18.269 14.1325H14.2073C9.68135 14.1325 7.7472 15.4477 7.7472 17.1498V22.1012H32.8139C34.0517 22.1012 34.3225 22.7975 34.3225 24.1901C34.3225 25.5827 34.0517 26.279 32.8139 26.279H7.7472V36.3366C7.7472 37.8066 6.85749 38.1547 5.15543 38.1547C3.49205 38.1547 2.60234 37.8066 2.60234 36.3366V17.1498C2.60234 12.3144 6.43197 9.95473 14.0525 9.95473ZM62.4452 38H51.1884C43.5678 38 39.7382 35.6016 39.7382 30.8049V17.1498C39.7382 12.3144 43.5678 9.95473 51.1884 9.95473H62.4452C70.0657 9.95473 73.8954 12.3144 73.8954 17.1498V30.8049C73.8954 35.6016 70.0657 38 62.4452 38ZM62.2904 33.8222C66.8163 33.8222 68.7892 32.4683 68.7892 30.8049V17.1498C68.7892 15.4477 66.8163 14.1325 62.2904 14.1325H51.3431C46.8172 14.1325 44.8443 15.4477 44.8443 17.1498V30.8049C44.8443 32.4683 46.8172 33.8222 51.3431 33.8222H62.2904ZM103.874 38H91.9598C84.3392 38 80.5096 35.6016 80.5096 30.8049V11.6181C80.5096 10.1481 81.3993 9.79999 83.0627 9.79999C84.7647 9.79999 85.6544 10.1481 85.6544 11.6181V30.8049C85.6544 32.4683 87.5886 33.8222 92.1145 33.8222H103.719C108.245 33.8222 110.18 32.4683 110.18 30.8049V11.6181C110.18 10.1481 111.069 9.79999 112.771 9.79999C114.435 9.79999 115.324 10.1481 115.324 11.6181V30.8049C115.324 35.6016 111.495 38 103.874 38ZM154.562 38.1547C153.169 38.1547 152.86 37.9613 151.506 36.8395L127.445 16.5695V36.3366C127.445 37.8066 126.555 38.1547 124.853 38.1547C123.19 38.1547 122.3 37.8066 122.3 36.3366V11.6181C122.3 10.1868 123.151 9.79999 124.737 9.79999C126.439 9.79999 127.174 10.2255 128.373 11.2313L152.086 31.4239V11.6181C152.086 10.1481 152.976 9.79999 154.639 9.79999C156.341 9.79999 157.231 10.1481 157.231 11.6181V36.3366C157.231 37.8453 156.341 38.1547 154.562 38.1547ZM199.514 17.1498V30.8049C199.514 35.6016 195.723 38 188.064 38H166.131C164.932 38 164.351 37.3811 164.351 36.1819V11.7341C164.351 10.535 164.932 9.95473 166.131 9.95473H188.064C195.723 9.95473 199.514 12.3144 199.514 17.1498ZM169.496 14.1325V33.8222H187.909C192.435 33.8222 194.447 32.4683 194.447 30.8049V17.1498C194.447 15.4477 192.435 14.1325 187.909 14.1325H169.496ZM222.724 9.83868C224.233 9.83868 225.123 10.3416 225.742 11.1926L242.608 35.2535C242.801 35.563 242.878 35.8724 242.878 36.1432C242.878 37.3037 241.37 38.1934 240.055 38.1934C239.358 38.1934 238.739 37.9613 238.352 37.4198L233.788 30.7663H212.28L207.986 37.4198C207.638 37.9613 206.98 38.1934 206.323 38.1934C205.046 38.1934 203.538 37.3037 203.538 36.1045C203.538 35.7951 203.654 35.5243 203.808 35.2535L219.669 11.1926C220.249 10.3416 221.177 9.83868 222.724 9.83868ZM222.724 14.558L214.949 26.5885H230.925L222.724 14.558ZM269.146 14.1325H257.464V36.3366C257.464 37.8066 256.574 38.1547 254.872 38.1547C253.209 38.1547 252.319 37.8066 252.319 36.3366V14.1325H240.676C239.438 14.1325 239.167 13.4362 239.167 12.0436C239.167 10.651 239.438 9.95473 240.676 9.95473H269.146C270.384 9.95473 270.655 10.651 270.655 12.0436C270.655 13.4362 270.384 14.1325 269.146 14.1325ZM281.559 11.6181V36.3366C281.559 37.8066 280.67 38.1547 278.968 38.1547C277.304 38.1547 276.415 37.8066 276.415 36.3366V11.6181C276.415 10.1481 277.304 9.79999 278.968 9.79999C280.67 9.79999 281.559 10.1481 281.559 11.6181ZM311.019 38H299.762C292.142 38 288.312 35.6016 288.312 30.8049V17.1498C288.312 12.3144 292.142 9.95473 299.762 9.95473H311.019C318.64 9.95473 322.469 12.3144 322.469 17.1498V30.8049C322.469 35.6016 318.64 38 311.019 38ZM310.864 33.8222C315.39 33.8222 317.363 32.4683 317.363 30.8049V17.1498C317.363 15.4477 315.39 14.1325 310.864 14.1325H299.917C295.391 14.1325 293.418 15.4477 293.418 17.1498V30.8049C293.418 32.4683 295.391 33.8222 299.917 33.8222H310.864ZM361.5 38.1547C360.107 38.1547 359.798 37.9613 358.444 36.8395L334.383 16.5695V36.3366C334.383 37.8066 333.493 38.1547 331.791 38.1547C330.128 38.1547 329.238 37.8066 329.238 36.3366V11.6181C329.238 10.1868 330.089 9.79999 331.675 9.79999C333.377 9.79999 334.112 10.2255 335.311 11.2313L359.024 31.4239V11.6181C359.024 10.1481 359.914 9.79999 361.577 9.79999C363.279 9.79999 364.169 10.1481 364.169 11.6181V36.3366C364.169 37.8453 363.279 38.1547 361.5 38.1547Z"
      fill="#707175"
    />
  </svg>
    <div
      class="w-full max-w-[730px] border-2 border-[#D9D9D9] bg-white rounded-[15px]"
    >
      <div class="flex flex-col justify-between border-[#D9D9D9] pt-4 px-5">
        <div class="flex items-start justify-between border-[#D9D9D9]">
          <div class="flex flex-col gap-[18px]">
            <div class="flex items-start gap-4">
            <!-- Badge Img -->
              <div class="relative h-fit w-fit">
              <svg xmlns="http://www.w3.org/2000/svg" width="22.888" height="29px" viewBox="0 0 70 87" fill="none">
              <path d="M51.0194 72.8123C40.1235 78.2972 34.9072 83.3674 34.9072 83.3674C34.9072 83.3674 29.6909 78.2972 18.795 72.8123C1.13089 63.9202 2.51154 44.862 2.68746 13.9971L15.6913 2.63037H54.1231L67.127 13.9971C67.3107 44.862 68.6835 63.9202 51.0194 72.8123Z" fill="url(#paint0_linear_2612_2953)"/>
              <g style="mix-blend-mode:color-burn">
                <path d="M51.0204 72.8123C40.1245 78.2972 34.9082 83.3674 34.9082 83.3674V2.63037H54.1241L67.1279 13.9971C67.3117 44.862 68.6845 63.9202 51.0204 72.8123Z" fill="#DFCC22"/>
              </g>
              <path d="M34.905 87L33.1159 85.2684C33.0704 85.2238 27.9876 80.3751 17.6445 75.1693C9.21931 70.9282 4.21664 64.222 1.90457 54.0655C-0.15776 44.9756 -0.0682305 33.8386 0.0527133 19.7358C0.0694675 17.8661 0.0846509 15.948 0.0982636 13.9815V12.7841L14.7309 0H55.0869L69.7132 12.7841V13.9815C69.7258 15.948 69.741 17.8661 69.7588 19.7358C69.8797 33.8386 69.9755 44.9756 67.9069 54.0655C65.5948 64.222 60.5922 70.9282 52.1669 75.1693C41.8239 80.3751 36.7411 85.2238 36.6908 85.2716L34.905 87ZM5.27372 15.2108C5.2622 16.7659 5.24963 18.2897 5.23602 19.7821C5.00513 46.6466 4.86848 62.8635 19.9472 70.4562C27.5447 74.2828 32.4735 77.9149 34.9081 79.9064C37.3411 77.9149 42.27 74.2796 49.8674 70.4562C64.9461 62.8635 64.8111 46.6466 64.5802 19.7821C64.5676 18.2886 64.555 16.7649 64.5425 15.2108L53.1628 5.26161H16.6487L5.27372 15.2108Z" fill="url(#paint1_linear_2612_2953)"/>
              <path d="M34.9064 83.5882L34.798 83.483C34.7462 83.4336 29.4702 78.3649 18.725 72.9598C10.8967 69.0183 6.4406 63.0217 4.27461 53.5077C2.26883 44.7033 2.36464 33.6938 2.48401 19.7553C2.49972 17.8824 2.5149 15.9616 2.52956 13.993V13.9213L15.6323 2.47168H54.1867L67.2879 13.9245V13.9962C67.2994 15.9648 67.3141 17.8856 67.3319 19.7585C67.4513 33.697 67.5471 44.7049 65.5413 53.5093C63.3769 63.0185 58.9208 69.0152 51.0909 72.9614C40.3457 78.3697 35.0697 83.4383 35.0179 83.4846L34.9064 83.5882ZM2.8437 14.0711C2.83218 16.0142 2.81752 17.9111 2.79972 19.7617C2.68035 33.6778 2.58611 44.6714 4.5809 53.4392C6.72333 62.8463 11.1276 68.776 18.8648 72.6696C28.8136 77.6793 34.1006 82.4036 34.9064 83.1514C35.7137 82.4036 41.0007 77.6793 50.9495 72.6696C58.6868 68.776 63.091 62.8447 65.2334 53.4376C67.2298 44.6682 67.134 33.6778 67.0146 19.7601C66.9989 17.9105 66.9842 16.0142 66.9706 14.0711L54.0642 2.79057H15.7501L2.8437 14.0711Z" fill="#7A7016"/>
              <path d="M29.6753 54.0547L30.1434 55.0177L31.1894 55.1724L30.4324 55.9218L30.6114 56.9789L29.6753 56.4798L28.7392 56.9789L28.9182 55.9218L28.1611 55.1724L29.2072 55.0177L29.6753 54.0547Z" fill="#7A7016"/>
              <path d="M25.6643 55.3892L26.013 56.1051L26.7905 56.2199L26.2282 56.7763L26.3601 57.564L25.6643 57.1925L24.9685 57.564L25.102 56.7763L24.5381 56.2199L25.3172 56.1051L25.6643 55.3892Z" fill="#7A7016"/>
              <path d="M40.1431 54.0547L39.675 55.0177L38.6289 55.1724L39.386 55.9218L39.2069 56.9789L40.1431 56.4798L41.0792 56.9789L40.9001 55.9218L41.6572 55.1724L40.6111 55.0177L40.1431 54.0547Z" fill="#7A7016"/>
              <path d="M44.1535 55.3892L43.8048 56.1051L43.0273 56.2199L43.5897 56.7763L43.4577 57.564L44.1535 57.1925L44.8494 57.564L44.7158 56.7763L45.2797 56.2199L44.5007 56.1051L44.1535 55.3892Z" fill="#7A7016"/>
              <path d="M34.9057 52.2129L35.6157 53.6734L37.2037 53.9062L36.0539 55.043L36.3256 56.647L34.9057 55.8896L33.4874 56.647L33.7576 55.043L32.6094 53.9062L34.1974 53.6734L34.9057 52.2129Z" fill="#7A7016"/>
              <path d="M41.7939 11.3767C41.7656 11.3767 39.752 11.2013 37.8326 11.0929C39.7583 10.9845 41.7594 10.8123 41.7986 10.8091C42.0344 10.7777 42.2484 10.653 42.394 10.4622C42.5396 10.2713 42.6051 10.0299 42.5761 9.79027C42.5496 9.59556 42.4484 9.41936 42.2946 9.29994C42.1407 9.18053 41.9467 9.12754 41.7546 9.1525C41.6757 9.16215 41.5994 9.18759 41.5302 9.22736C41.461 9.26713 41.4002 9.32043 41.3514 9.38419C41.3026 9.44795 41.2668 9.5209 41.2459 9.59881C41.2251 9.67672 41.2197 9.75806 41.23 9.83811C41.2377 9.90452 41.2585 9.96869 41.2911 10.0268C41.3238 10.0848 41.3677 10.1356 41.4201 10.1761C41.5248 10.2588 41.6575 10.296 41.7892 10.2798C41.844 10.2727 41.8969 10.2547 41.9449 10.2268C41.9928 10.1989 42.0349 10.1616 42.0686 10.1172C42.1023 10.0727 42.127 10.0219 42.1414 9.96776C42.1557 9.91357 42.1593 9.85705 42.152 9.80143C42.1399 9.70778 42.0918 9.62277 42.0183 9.56486C41.9448 9.50695 41.8517 9.48081 41.7594 9.49211C41.6814 9.50324 41.6107 9.54475 41.5623 9.60784C41.514 9.67093 41.4917 9.75066 41.5002 9.83013C41.5009 9.84188 41.5039 9.85335 41.5091 9.86386C41.5143 9.87436 41.5216 9.88368 41.5305 9.89122C41.5394 9.89876 41.5497 9.90437 41.5608 9.9077C41.5719 9.91104 41.5836 9.91203 41.5951 9.91061C41.6066 9.90919 41.6177 9.90539 41.6277 9.89945C41.6377 9.89351 41.6464 9.88556 41.6532 9.87608C41.6601 9.86659 41.665 9.85578 41.6676 9.84432C41.6701 9.83285 41.6704 9.82097 41.6683 9.80941C41.6646 9.77508 41.6742 9.74066 41.695 9.71333C41.7158 9.686 41.7461 9.66787 41.7798 9.66272C41.8275 9.65723 41.8755 9.67079 41.9136 9.70054C41.9517 9.73029 41.9769 9.7739 41.984 9.82216C41.992 9.88832 41.9738 9.955 41.9335 10.0076C41.8931 10.0602 41.8339 10.0944 41.7688 10.1028C41.7256 10.1087 41.6817 10.1058 41.6396 10.0943C41.5976 10.0828 41.5582 10.0629 41.5238 10.0358C41.4544 9.9805 41.4093 9.89977 41.3981 9.811C41.3839 9.69495 41.4156 9.57791 41.4862 9.48555C41.5569 9.39319 41.6608 9.33305 41.7751 9.31832C41.9231 9.30113 42.0719 9.34362 42.1894 9.43665C42.3069 9.52969 42.3837 9.66583 42.4033 9.81578C42.4266 10.0096 42.3736 10.205 42.2561 10.3595C42.1385 10.5141 41.9657 10.6155 41.7751 10.6417C41.7327 10.6417 37.5892 11.0004 35.5048 11.01C35.4839 10.864 35.412 10.7306 35.3021 10.6341C35.1922 10.5375 35.0517 10.4844 34.9064 10.4844C34.7611 10.4844 34.6206 10.5375 34.5107 10.6341C34.4008 10.7306 34.3289 10.864 34.308 11.01C32.2268 11.01 28.0723 10.6449 28.033 10.6417C27.842 10.6163 27.6687 10.5151 27.551 10.3603C27.4333 10.2056 27.3807 10.0098 27.4047 9.81578C27.4236 9.66547 27.5002 9.52882 27.6179 9.43563C27.7356 9.34244 27.8848 9.30027 28.033 9.31832C28.1473 9.33305 28.2512 9.39319 28.3218 9.48555C28.3925 9.57791 28.4242 9.69495 28.41 9.811C28.4047 9.85481 28.391 9.89714 28.3696 9.93555C28.3482 9.97396 28.3195 10.0077 28.2852 10.0348C28.2509 10.0619 28.2117 10.0819 28.1697 10.0936C28.1278 10.1052 28.084 10.1084 28.0409 10.1028C27.9756 10.0944 27.9163 10.0602 27.8757 10.0077C27.8351 9.95516 27.8166 9.88849 27.8241 9.82216C27.8308 9.77372 27.8559 9.72986 27.8941 9.70004C27.9323 9.67022 27.9805 9.65682 28.0283 9.66272C28.0619 9.66787 28.0923 9.686 28.1131 9.71333C28.1339 9.74066 28.1434 9.77508 28.1398 9.80941C28.1377 9.82097 28.138 9.83285 28.1405 9.84432C28.1431 9.85578 28.148 9.86659 28.1548 9.87608C28.1617 9.88556 28.1704 9.89351 28.1804 9.89945C28.1904 9.90539 28.2015 9.90919 28.213 9.91061C28.2245 9.91203 28.2362 9.91104 28.2473 9.9077C28.2584 9.90437 28.2687 9.89876 28.2776 9.89122C28.2865 9.88368 28.2938 9.87436 28.299 9.86386C28.3042 9.85335 28.3072 9.84188 28.3079 9.83013C28.3168 9.75058 28.2947 9.67064 28.2462 9.60745C28.1978 9.54426 28.1269 9.50286 28.0487 9.49211C28.0023 9.48658 27.9552 9.49046 27.9102 9.50354C27.8653 9.51661 27.8233 9.53862 27.7868 9.56828C27.7502 9.59794 27.7199 9.63467 27.6974 9.67634C27.675 9.718 27.6609 9.76378 27.6561 9.811C27.6488 9.86661 27.6524 9.92314 27.6667 9.97733C27.6811 10.0315 27.7058 10.0823 27.7395 10.1267C27.7732 10.1712 27.8153 10.2084 27.8632 10.2363C27.9112 10.2642 27.9641 10.2823 28.0189 10.2893C28.0859 10.2982 28.154 10.2932 28.2191 10.2748C28.2843 10.2563 28.345 10.2247 28.3978 10.1818C28.4506 10.1389 28.4943 10.0857 28.5264 10.0253C28.5584 9.96484 28.5781 9.89847 28.5843 9.83013C28.5947 9.75008 28.5893 9.66875 28.5684 9.59084C28.5476 9.51292 28.5117 9.43998 28.4629 9.37622C28.4142 9.31246 28.3534 9.25916 28.2842 9.21939C28.215 9.17962 28.1387 9.15417 28.0597 9.14453C27.8677 9.12 27.6739 9.17314 27.5202 9.29248C27.3665 9.41182 27.2652 9.58777 27.2382 9.7823C27.2238 9.90157 27.2326 10.0226 27.2642 10.1384C27.2959 10.2542 27.3497 10.3625 27.4227 10.4571C27.4956 10.5518 27.5863 10.6309 27.6894 10.6899C27.7925 10.7489 27.9061 10.7867 28.0236 10.8011C28.0519 10.8011 30.0655 10.9765 31.9849 11.0849C30.0592 11.1934 28.0582 11.3672 28.0205 11.3688C27.7833 11.3983 27.5673 11.5221 27.4201 11.7132C27.2728 11.9042 27.2063 12.1468 27.2351 12.3876C27.2472 12.4851 27.2782 12.5792 27.3261 12.6646C27.3741 12.7499 27.4382 12.8249 27.5147 12.8851C27.6422 12.9875 27.7998 13.0436 27.9623 13.0445C27.9938 13.0445 28.0252 13.0445 28.0566 13.0445C28.1354 13.0345 28.2115 13.0088 28.2805 12.9688C28.3495 12.9289 28.4101 12.8755 28.4587 12.8117C28.5087 12.7485 28.5457 12.6756 28.5673 12.5976C28.5889 12.5195 28.5947 12.4377 28.5843 12.3573C28.5675 12.2237 28.4992 12.1022 28.3944 12.0195C28.2897 11.9367 28.1569 11.8994 28.0252 11.9156C27.9702 11.9223 27.917 11.9401 27.8689 11.9678C27.8207 11.9956 27.7785 12.0329 27.7447 12.0774C27.7109 12.122 27.6862 12.1729 27.6721 12.2273C27.6579 12.2816 27.6546 12.3383 27.6623 12.394C27.6749 12.4873 27.7231 12.5719 27.7965 12.6295C27.87 12.6871 27.9629 12.713 28.055 12.7017C28.1334 12.6913 28.2045 12.65 28.253 12.5868C28.3016 12.5235 28.3235 12.4433 28.3142 12.3637C28.3102 12.3422 28.2984 12.323 28.281 12.31C28.2636 12.297 28.242 12.2913 28.2206 12.2939C28.1991 12.2966 28.1795 12.3074 28.1657 12.3242C28.1519 12.341 28.1449 12.3625 28.1461 12.3844C28.1497 12.4187 28.1402 12.4532 28.1194 12.4805C28.0986 12.5078 28.0682 12.5259 28.0346 12.5311C27.9868 12.537 27.9386 12.5236 27.9004 12.4938C27.8622 12.464 27.837 12.4201 27.8304 12.3717C27.8262 12.3387 27.8285 12.3051 27.8372 12.273C27.8459 12.241 27.8607 12.2109 27.8808 12.1847C27.901 12.1584 27.9261 12.1365 27.9546 12.1202C27.9832 12.1038 28.0146 12.0934 28.0472 12.0894C28.1341 12.079 28.2216 12.1038 28.2907 12.1584C28.3598 12.2131 28.4049 12.2931 28.4163 12.3812C28.4237 12.4387 28.4199 12.4972 28.4049 12.5532C28.39 12.6092 28.3642 12.6617 28.3292 12.7075C28.2941 12.7533 28.2504 12.7916 28.2007 12.8202C28.1509 12.8488 28.0961 12.867 28.0393 12.8739C27.9659 12.8843 27.8911 12.8795 27.8196 12.8598C27.7481 12.8401 27.6812 12.8058 27.6231 12.7591C27.5638 12.7132 27.5141 12.6557 27.4772 12.59C27.4402 12.5242 27.4166 12.4516 27.4079 12.3764C27.3838 12.1826 27.4365 11.987 27.5542 11.8325C27.672 11.678 27.8453 11.5772 28.0362 11.5521C28.0786 11.5521 32.2346 11.1902 34.319 11.1838C34.341 11.3287 34.4133 11.4608 34.5229 11.5562C34.6326 11.6516 34.7722 11.7041 34.9166 11.7041C35.061 11.7041 35.2007 11.6516 35.3103 11.5562C35.4199 11.4608 35.4922 11.3287 35.5143 11.1838C37.5986 11.1838 41.7421 11.5489 41.7813 11.5505C41.972 11.5768 42.1448 11.6781 42.2624 11.8327C42.3799 11.9872 42.4328 12.1826 42.4096 12.3764C42.3906 12.5279 42.3132 12.6654 42.1944 12.7591C42.1359 12.8057 42.0688 12.8399 41.997 12.8596C41.9253 12.8793 41.8503 12.8842 41.7766 12.8739C41.7199 12.867 41.665 12.8488 41.6153 12.8202C41.5655 12.7916 41.5218 12.7533 41.4868 12.7075C41.4517 12.6617 41.426 12.6092 41.411 12.5532C41.396 12.4972 41.3922 12.4387 41.3997 12.3812C41.411 12.2929 41.4561 12.2127 41.5253 12.158C41.5596 12.1306 41.599 12.1104 41.641 12.0987C41.6831 12.0869 41.7271 12.0838 41.7704 12.0894C41.8028 12.0936 41.834 12.1042 41.8624 12.1206C41.8908 12.137 41.9157 12.159 41.9357 12.1852C41.9557 12.2114 41.9704 12.2414 41.9789 12.2734C41.9875 12.3054 41.9897 12.3388 41.9855 12.3717C41.9793 12.42 41.9545 12.4638 41.9165 12.4937C41.8786 12.5235 41.8306 12.537 41.7829 12.5311C41.749 12.5263 41.7182 12.5083 41.6971 12.481C41.676 12.4536 41.6662 12.419 41.6698 12.3844C41.6714 12.3732 41.6707 12.3617 41.6677 12.3508C41.6648 12.3399 41.6598 12.3296 41.6529 12.3207C41.646 12.3118 41.6374 12.3043 41.6277 12.2988C41.6179 12.2934 41.6071 12.2899 41.596 12.2887C41.5737 12.286 41.5513 12.2924 41.5336 12.3065C41.516 12.3205 41.5045 12.3411 41.5018 12.3637C41.4928 12.4432 41.515 12.5232 41.5634 12.5864C41.6119 12.6496 41.6828 12.691 41.7609 12.7017C41.8533 12.713 41.9464 12.6869 42.0199 12.629C42.0934 12.571 42.1415 12.486 42.1536 12.3924C42.1613 12.3367 42.158 12.28 42.1438 12.2257C42.1297 12.1713 42.105 12.1204 42.0712 12.0758C42.0374 12.0313 41.9952 11.994 41.9471 11.9662C41.8989 11.9385 41.8458 11.9207 41.7908 11.9141C41.6592 11.8978 41.5267 11.9349 41.422 12.0173C41.3173 12.0997 41.2488 12.2208 41.2316 12.3541C41.2215 12.434 41.227 12.5152 41.2478 12.5929C41.2686 12.6706 41.3044 12.7434 41.353 12.8071C41.4015 12.8708 41.462 12.9241 41.531 12.964C41.5999 13.004 41.6759 13.0297 41.7546 13.0397C41.7865 13.042 41.8186 13.042 41.8505 13.0397C42.013 13.0389 42.1706 12.9827 42.2981 12.8803C42.3746 12.8201 42.4387 12.7452 42.4867 12.6598C42.5346 12.5744 42.5656 12.4803 42.5777 12.3828C42.603 12.1443 42.5351 11.9052 42.3885 11.7171C42.2419 11.5289 42.0284 11.4067 41.7939 11.3767ZM35.3462 11.0929C35.3462 11.1803 35.3207 11.2657 35.2729 11.3383C35.2251 11.4109 35.1571 11.4675 35.0776 11.501C34.9981 11.5344 34.9106 11.5431 34.8262 11.5261C34.7418 11.5091 34.6643 11.467 34.6035 11.4052C34.5426 11.3435 34.5012 11.2648 34.4844 11.1791C34.4676 11.0934 34.4762 11.0046 34.5091 10.9239C34.5421 10.8432 34.5978 10.7742 34.6694 10.7257C34.7409 10.6772 34.8251 10.6513 34.9111 10.6513C35.0265 10.6513 35.1372 10.6978 35.2188 10.7806C35.3004 10.8634 35.3462 10.9758 35.3462 11.0929Z" fill="#7A7016"/>
              <path d="M26.8082 10.168L26.3716 10.2923C26.3464 10.2923 23.871 10.9939 19.5108 11.005C19.4894 10.8877 19.4256 10.7827 19.3319 10.7107C19.2383 10.6386 19.1214 10.6047 19.0044 10.6156C18.8874 10.6265 18.7785 10.6814 18.6993 10.7695C18.6201 10.8576 18.5762 10.9726 18.5762 11.0919C18.5762 11.2112 18.6201 11.3262 18.6993 11.4144C18.7785 11.5025 18.8874 11.5574 19.0044 11.5683C19.1214 11.5792 19.2383 11.5452 19.3319 11.4732C19.4256 11.4011 19.4894 11.2962 19.5108 11.1788C23.8726 11.1884 26.348 11.8836 26.3731 11.89L26.8098 12.0159L25.6003 11.0911L26.8082 10.168ZM19.0443 11.3941C18.9839 11.3944 18.9247 11.3765 18.8744 11.3426C18.824 11.3088 18.7847 11.2605 18.7615 11.2039C18.7382 11.1473 18.732 11.085 18.7437 11.0248C18.7555 10.9647 18.7845 10.9094 18.8272 10.866C18.8699 10.8227 18.9244 10.7932 18.9836 10.7813C19.0429 10.7694 19.1043 10.7757 19.16 10.7993C19.2158 10.8229 19.2633 10.8628 19.2967 10.9139C19.3301 10.965 19.3477 11.025 19.3474 11.0864C19.347 11.1678 19.3149 11.2459 19.2582 11.3035C19.2014 11.3611 19.1245 11.3937 19.0443 11.3941ZM26.0166 11.6269C24.7009 11.3493 23.367 11.1703 22.0254 11.0911C23.367 11.0129 24.7011 10.8338 26.0166 10.5554L25.3145 11.0911L26.0166 11.6269Z" fill="#7A7016"/>
              <path d="M26.9352 11.703C26.8159 11.703 26.6993 11.6671 26.6001 11.5999C26.5009 11.5326 26.4236 11.437 26.3779 11.3251C26.3323 11.2132 26.3203 11.0901 26.3436 10.9713C26.3669 10.8526 26.4243 10.7435 26.5087 10.6578C26.593 10.5722 26.7005 10.5139 26.8175 10.4903C26.9345 10.4667 27.0558 10.4788 27.166 10.5251C27.2762 10.5715 27.3704 10.6499 27.4367 10.7506C27.503 10.8513 27.5383 10.9697 27.5383 11.0908C27.5379 11.253 27.4742 11.4085 27.3612 11.5232C27.2482 11.638 27.095 11.7026 26.9352 11.703ZM26.9352 10.6507C26.8494 10.6507 26.7656 10.6765 26.6943 10.7249C26.623 10.7732 26.5675 10.842 26.5347 10.9224C26.5019 11.0028 26.4933 11.0913 26.51 11.1766C26.5267 11.262 26.568 11.3404 26.6286 11.4019C26.6893 11.4635 26.7665 11.5054 26.8506 11.5224C26.9347 11.5394 27.0219 11.5306 27.1011 11.4973C27.1803 11.464 27.248 11.4076 27.2956 11.3353C27.3433 11.2629 27.3687 11.1778 27.3687 11.0908C27.3683 10.9742 27.3225 10.8625 27.2413 10.7801C27.1601 10.6976 27.05 10.6511 26.9352 10.6507Z" fill="#7A7016"/>
              <path d="M50.7716 10.6048C50.6589 10.6033 50.5494 10.6428 50.4629 10.7163C50.3765 10.7897 50.3188 10.8922 50.3004 11.005C45.9386 10.9939 43.4647 10.2987 43.4396 10.2923L43.0029 10.168L44.2139 11.0911L43.0029 12.0159L43.4396 11.89C43.4647 11.89 45.937 11.1884 50.302 11.1788C50.3197 11.2671 50.3617 11.3485 50.423 11.4136C50.4844 11.4787 50.5626 11.5249 50.6486 11.5469C50.7347 11.5689 50.8251 11.5658 50.9095 11.5379C50.9939 11.51 51.0688 11.4585 51.1256 11.3893C51.1824 11.3201 51.2189 11.236 51.2307 11.1467C51.2425 11.0574 51.2292 10.9666 51.1924 10.8846C51.1555 10.8026 51.0966 10.7329 51.0225 10.6834C50.9483 10.6339 50.8619 10.6067 50.7732 10.6048H50.7716ZM43.8008 11.6269L44.5029 11.0911L43.8008 10.5554C45.1158 10.834 46.4493 11.013 47.7904 11.0911C46.4494 11.1701 45.1159 11.3492 43.8008 11.6269ZM50.7716 11.3941C50.7112 11.3944 50.6521 11.3765 50.6017 11.3426C50.5514 11.3088 50.5121 11.2605 50.4888 11.2039C50.4656 11.1473 50.4594 11.085 50.4711 11.0248C50.4828 10.9647 50.5119 10.9094 50.5546 10.866C50.5973 10.8227 50.6517 10.7932 50.711 10.7813C50.7702 10.7694 50.8316 10.7757 50.8874 10.7993C50.9431 10.8229 50.9907 10.8628 51.0241 10.9139C51.0574 10.965 51.0751 11.025 51.0748 11.0864C51.0748 11.1268 51.0669 11.1668 51.0517 11.2041C51.0364 11.2415 51.0141 11.2754 50.986 11.304C50.9578 11.3325 50.9244 11.3552 50.8876 11.3707C50.8508 11.3861 50.8114 11.3941 50.7716 11.3941Z" fill="#7A7016"/>
              <path d="M42.8795 11.703C42.7602 11.703 42.6436 11.6671 42.5444 11.5999C42.4452 11.5326 42.3679 11.437 42.3223 11.3251C42.2766 11.2132 42.2647 11.0901 42.288 10.9713C42.3112 10.8526 42.3687 10.7435 42.453 10.6578C42.5374 10.5722 42.6448 10.5139 42.7618 10.4903C42.8788 10.4667 43.0001 10.4788 43.1103 10.5251C43.2205 10.5715 43.3147 10.6499 43.381 10.7506C43.4473 10.8513 43.4827 10.9697 43.4827 11.0908C43.4822 11.253 43.4186 11.4085 43.3055 11.5232C43.1925 11.638 43.0394 11.7026 42.8795 11.703ZM42.8795 10.6507C42.7938 10.6507 42.71 10.6765 42.6387 10.7249C42.5674 10.7732 42.5118 10.842 42.479 10.9224C42.4462 11.0028 42.4376 11.0913 42.4543 11.1766C42.4711 11.262 42.5123 11.3404 42.573 11.4019C42.6336 11.4635 42.7108 11.5054 42.7949 11.5224C42.879 11.5394 42.9662 11.5306 43.0454 11.4973C43.1246 11.464 43.1923 11.4076 43.24 11.3353C43.2876 11.2629 43.313 11.1778 43.313 11.0908C43.3126 10.9742 43.2668 10.8625 43.1856 10.7801C43.1044 10.6976 42.9944 10.6511 42.8795 10.6507Z" fill="#7A7016"/>
              <path d="M41.7943 66.8358C41.7661 66.8358 39.7524 66.6604 37.833 66.552C39.7587 66.4435 41.7598 66.2713 41.7991 66.2682C42.0348 66.2367 42.2488 66.112 42.3944 65.9212C42.54 65.7304 42.6055 65.4889 42.5765 65.2493C42.5519 65.0531 42.4515 64.875 42.2975 64.7539C42.1434 64.6328 41.9483 64.5787 41.7551 64.6036C41.6761 64.6132 41.5998 64.6387 41.5306 64.6784C41.4614 64.7182 41.4006 64.7715 41.3519 64.8353C41.3031 64.899 41.2672 64.972 41.2464 65.0499C41.2255 65.1278 41.2201 65.2091 41.2305 65.2892C41.2381 65.3556 41.2589 65.4198 41.2916 65.4778C41.3242 65.5359 41.3681 65.5867 41.4205 65.6272C41.5253 65.7098 41.6579 65.7471 41.7896 65.7308C41.8445 65.7238 41.8974 65.7057 41.9453 65.6778C41.9933 65.6499 42.0353 65.6127 42.069 65.5682C42.1027 65.5238 42.1275 65.473 42.1418 65.4188C42.1561 65.3646 42.1597 65.3081 42.1525 65.2525C42.1403 65.1588 42.0923 65.0738 42.0187 65.0159C41.9452 64.958 41.8522 64.9319 41.7598 64.9432C41.6818 64.9543 41.6111 64.9958 41.5628 65.0589C41.5144 65.122 41.4921 65.2017 41.5006 65.2812C41.5013 65.2929 41.5043 65.3044 41.5095 65.3149C41.5147 65.3254 41.522 65.3347 41.5309 65.3423C41.5398 65.3498 41.5501 65.3554 41.5612 65.3588C41.5724 65.3621 41.584 65.3631 41.5955 65.3617C41.607 65.3603 41.6181 65.3565 41.6281 65.3505C41.6381 65.3446 41.6468 65.3366 41.6537 65.3271C41.6605 65.3177 41.6654 65.3068 41.668 65.2954C41.6706 65.2839 41.6708 65.272 41.6687 65.2605C41.6651 65.2261 41.6746 65.1917 41.6954 65.1644C41.7162 65.1371 41.7466 65.1189 41.7802 65.1138C41.828 65.1083 41.876 65.1219 41.9141 65.1516C41.9521 65.1814 41.9774 65.225 41.9844 65.2732C41.9924 65.3394 41.9742 65.4061 41.9339 65.4587C41.8936 65.5113 41.8344 65.5455 41.7692 65.5538C41.726 65.5597 41.6821 65.5569 41.6401 65.5454C41.598 65.5339 41.5586 65.514 41.5242 65.4869C41.4549 65.4316 41.4097 65.3508 41.3985 65.2621C41.3843 65.146 41.416 65.029 41.4867 64.9366C41.5573 64.8443 41.6612 64.7841 41.7755 64.7694C41.9235 64.7522 42.0723 64.7947 42.1898 64.8877C42.3073 64.9808 42.3842 65.1169 42.4038 65.2668C42.427 65.4607 42.3741 65.656 42.2565 65.8106C42.1389 65.9652 41.9661 66.0665 41.7755 66.0928C41.7331 66.0928 37.5896 66.4515 35.5053 66.4611C35.4844 66.3151 35.4124 66.1816 35.3025 66.0851C35.1926 65.9886 35.0521 65.9355 34.9068 65.9355C34.7615 65.9355 34.621 65.9886 34.5112 66.0851C34.4013 66.1816 34.3293 66.3151 34.3084 66.4611C32.2272 66.4531 28.0727 66.096 28.0334 66.0928C27.8425 66.0673 27.6692 65.9662 27.5514 65.8114C27.4337 65.6566 27.3811 65.4609 27.4052 65.2668C27.424 65.1165 27.5006 64.9799 27.6183 64.8867C27.736 64.7935 27.8852 64.7513 28.0334 64.7694C28.1477 64.7841 28.2516 64.8443 28.3223 64.9366C28.3929 65.029 28.4246 65.146 28.4104 65.2621C28.4052 65.3059 28.3914 65.3482 28.37 65.3866C28.3486 65.425 28.3199 65.4588 28.2856 65.4859C28.2513 65.513 28.2121 65.533 28.1701 65.5446C28.1282 65.5563 28.0844 65.5594 28.0413 65.5538C27.976 65.5455 27.9167 65.5113 27.8761 65.4588C27.8355 65.4062 27.817 65.3396 27.8245 65.2732C27.8312 65.2248 27.8563 65.1809 27.8945 65.1511C27.9327 65.1213 27.9809 65.1079 28.0287 65.1138C28.0624 65.1189 28.0927 65.1371 28.1135 65.1644C28.1343 65.1917 28.1439 65.2261 28.1403 65.2605C28.1381 65.272 28.1384 65.2839 28.141 65.2954C28.1435 65.3068 28.1484 65.3177 28.1553 65.3271C28.1621 65.3366 28.1708 65.3446 28.1808 65.3505C28.1908 65.3565 28.2019 65.3603 28.2134 65.3617C28.2249 65.3631 28.2366 65.3621 28.2477 65.3588C28.2588 65.3554 28.2691 65.3498 28.278 65.3423C28.2869 65.3347 28.2942 65.3254 28.2994 65.3149C28.3046 65.3044 28.3076 65.2929 28.3083 65.2812C28.3172 65.2016 28.2951 65.1217 28.2467 65.0585C28.1982 64.9953 28.1273 64.9539 28.0492 64.9432C28.0027 64.9376 27.9556 64.9415 27.9106 64.9546C27.8657 64.9677 27.8237 64.9897 27.7872 65.0193C27.7507 65.049 27.7203 65.0857 27.6979 65.1274C27.6754 65.1691 27.6614 65.2148 27.6565 65.2621C27.6492 65.3177 27.6528 65.3742 27.6672 65.4284C27.6815 65.4826 27.7062 65.5334 27.7399 65.5778C27.7736 65.6223 27.8157 65.6595 27.8636 65.6874C27.9116 65.7153 27.9645 65.7333 28.0193 65.7404C28.1511 65.7566 28.2838 65.7193 28.3886 65.6366C28.4933 65.5538 28.5616 65.4324 28.5785 65.2987C28.5888 65.2187 28.5834 65.1374 28.5626 65.0594C28.5417 64.9815 28.5059 64.9086 28.4571 64.8448C28.4083 64.7811 28.3475 64.7278 28.2783 64.688C28.2091 64.6482 28.1328 64.6228 28.0539 64.6131C27.8607 64.5887 27.6658 64.643 27.5119 64.764C27.3579 64.885 27.2575 65.0629 27.2324 65.2589C27.2179 65.3781 27.2267 65.4991 27.2584 65.6149C27.29 65.7307 27.3439 65.8391 27.4168 65.9337C27.4898 66.0283 27.5804 66.1074 27.6835 66.1665C27.7866 66.2255 27.9002 66.2633 28.0177 66.2777C28.046 66.2777 30.0596 66.4531 31.979 66.5615C30.0534 66.6699 28.0523 66.8437 28.0146 66.8453C27.7774 66.8748 27.5615 66.9987 27.4142 67.1898C27.2669 67.3808 27.2004 67.6234 27.2292 67.8642C27.2414 67.9617 27.2723 68.0558 27.3203 68.1412C27.3682 68.2265 27.4323 68.3014 27.5088 68.3616C27.6363 68.4641 27.7939 68.5202 27.9565 68.5211C27.9879 68.5211 28.0193 68.5211 28.0507 68.5211C28.1295 68.5111 28.2056 68.4853 28.2746 68.4454C28.3437 68.4055 28.4042 68.3521 28.4528 68.2883C28.5021 68.225 28.5384 68.1523 28.5594 68.0745C28.5805 67.9967 28.5859 67.9154 28.5753 67.8355C28.5585 67.7018 28.4902 67.5804 28.3854 67.4976C28.2807 67.4149 28.1479 67.3776 28.0162 67.3938C27.9612 67.4005 27.908 67.4182 27.8599 67.446C27.8117 67.4738 27.7695 67.511 27.7357 67.5556C27.7019 67.6001 27.6772 67.6511 27.6631 67.7054C27.6489 67.7598 27.6456 67.8165 27.6533 67.8721C27.6659 67.9655 27.7141 68.0501 27.7875 68.1077C27.861 68.1653 27.9539 68.1912 28.046 68.1799C28.1244 68.1695 28.1955 68.1282 28.244 68.0649C28.2925 68.0016 28.3145 67.9215 28.3052 67.8419C28.3045 67.8301 28.3015 67.8186 28.2963 67.8081C28.291 67.7976 28.2838 67.7883 28.2749 67.7808C28.266 67.7732 28.2557 67.7676 28.2446 67.7643C28.2334 67.7609 28.2218 67.76 28.2103 67.7614C28.1988 67.7628 28.1877 67.7666 28.1777 67.7725C28.1677 67.7785 28.159 67.7864 28.1521 67.7959C28.1453 67.8054 28.1404 67.8162 28.1378 67.8277C28.1352 67.8391 28.135 67.851 28.1371 67.8626C28.1407 67.8969 28.1312 67.9313 28.1104 67.9587C28.0896 67.986 28.0592 68.0041 28.0256 68.0093C27.9778 68.0152 27.9296 68.0018 27.8914 67.9719C27.8532 67.9421 27.8281 67.8983 27.8214 67.8498C27.8133 67.7829 27.8313 67.7153 27.8717 67.6617C27.8918 67.6355 27.9169 67.6137 27.9455 67.5975C27.9741 67.5814 28.0056 67.5712 28.0382 67.5676C28.1251 67.5572 28.2126 67.582 28.2817 67.6366C28.3508 67.6912 28.3959 67.7713 28.4073 67.8594C28.4147 67.9169 28.4109 67.9754 28.3959 68.0314C28.381 68.0874 28.3552 68.1398 28.3202 68.1857C28.2851 68.2315 28.2414 68.2698 28.1917 68.2984C28.1419 68.3269 28.0871 68.3452 28.0303 68.3521C27.882 68.3705 27.7326 68.3285 27.6148 68.2353C27.497 68.142 27.4205 68.0051 27.402 67.8546C27.378 67.6608 27.4306 67.4652 27.5484 67.3107C27.6661 67.1562 27.8394 67.0553 28.0303 67.0303C28.0727 67.0303 32.2288 66.6684 34.3131 66.662C34.3351 66.8068 34.4075 66.9389 34.5171 67.0344C34.6267 67.1298 34.7663 67.1822 34.9108 67.1822C35.0552 67.1822 35.1948 67.1298 35.3044 67.0344C35.414 66.9389 35.4864 66.8068 35.5084 66.662C37.5927 66.6699 41.7362 67.0271 41.7755 67.0287C41.9661 67.0549 42.1389 67.1563 42.2565 67.3108C42.3741 67.4654 42.427 67.6607 42.4038 67.8546C42.3847 68.006 42.3073 68.1436 42.1886 68.2373C42.1299 68.2836 42.0628 68.3175 41.991 68.3372C41.9193 68.3569 41.8444 68.362 41.7708 68.3521C41.714 68.3452 41.6592 68.3269 41.6094 68.2984C41.5597 68.2698 41.516 68.2315 41.4809 68.1857C41.4459 68.1398 41.4201 68.0874 41.4051 68.0314C41.3902 67.9754 41.3863 67.9169 41.3938 67.8594C41.4052 67.7709 41.4505 67.6907 41.52 67.636C41.5894 67.5813 41.6773 67.5568 41.7645 67.5676C41.7968 67.5714 41.828 67.5817 41.8563 67.5978C41.8846 67.614 41.9094 67.6357 41.9294 67.6617C41.9697 67.7153 41.9878 67.7829 41.9797 67.8498C41.9734 67.8981 41.9486 67.942 41.9107 67.9718C41.8727 68.0017 41.8247 68.0151 41.7771 68.0093C41.7431 68.0045 41.7124 67.9865 41.6913 67.9591C41.6702 67.9318 41.6604 67.8971 41.664 67.8626C41.6655 67.8513 41.6648 67.8399 41.6619 67.829C41.659 67.818 41.6539 67.8078 41.6471 67.7989C41.6402 67.7899 41.6316 67.7825 41.6218 67.777C41.612 67.7715 41.6013 67.7681 41.5901 67.7669C41.5679 67.7642 41.5454 67.7706 41.5278 67.7846C41.5101 67.7987 41.4987 67.8192 41.4959 67.8419C41.487 67.9214 41.5091 68.0013 41.5576 68.0645C41.606 68.1277 41.6769 68.1691 41.7551 68.1799C41.8475 68.1912 41.9405 68.165 42.014 68.1071C42.0875 68.0492 42.1356 67.9642 42.1478 67.8705C42.1555 67.8149 42.1521 67.7582 42.138 67.7038C42.1238 67.6495 42.0991 67.5985 42.0654 67.554C42.0316 67.5094 41.9894 67.4722 41.9412 67.4444C41.893 67.4166 41.8399 67.3989 41.7849 67.3922C41.6534 67.3759 41.5209 67.4131 41.4161 67.4955C41.3114 67.5779 41.243 67.6989 41.2258 67.8323C41.2156 67.9122 41.2211 67.9933 41.242 68.0711C41.2628 68.1488 41.2985 68.2216 41.3471 68.2853C41.3957 68.349 41.4562 68.4023 41.5251 68.4422C41.594 68.4821 41.6701 68.5078 41.7488 68.5179C41.7807 68.5202 41.8127 68.5202 41.8446 68.5179C42.0072 68.517 42.1648 68.4609 42.2923 68.3584C42.3688 68.2982 42.4328 68.2233 42.4808 68.138C42.5288 68.0526 42.5597 67.9585 42.5718 67.861C42.6026 67.6204 42.5379 67.3772 42.3922 67.185C42.2464 66.9928 42.0313 66.8671 41.7943 66.8358ZM35.3466 66.552C35.3466 66.6393 35.3211 66.7247 35.2733 66.7973C35.2255 66.87 35.1575 66.9266 35.078 66.96C34.9985 66.9934 34.9111 67.0022 34.8267 66.9851C34.7423 66.9681 34.6647 66.926 34.6039 66.8643C34.543 66.8025 34.5016 66.7238 34.4848 66.6381C34.468 66.5524 34.4766 66.4636 34.5096 66.3829C34.5425 66.3022 34.5983 66.2333 34.6698 66.1847C34.7414 66.1362 34.8255 66.1103 34.9115 66.1103C35.0269 66.1103 35.1376 66.1568 35.2192 66.2397C35.3008 66.3225 35.3466 66.4348 35.3466 66.552Z" fill="#7A7016"/>
              <path d="M26.8082 65.6299L26.3716 65.7542C26.3464 65.7542 23.871 66.4558 19.5108 66.467C19.4894 66.3496 19.4256 66.2447 19.3319 66.1726C19.2383 66.1006 19.1214 66.0666 19.0044 66.0775C18.8874 66.0884 18.7785 66.1433 18.6993 66.2314C18.6201 66.3195 18.5762 66.4345 18.5762 66.5539C18.5762 66.6732 18.6201 66.7882 18.6993 66.8763C18.7785 66.9644 18.8874 67.0193 19.0044 67.0302C19.1214 67.0411 19.2383 67.0072 19.3319 66.9351C19.4256 66.8631 19.4894 66.7581 19.5108 66.6408C23.8726 66.6503 26.348 67.3455 26.3731 67.3519L26.8098 67.4778L25.5988 66.5531L26.8082 65.6299ZM19.0443 66.856C18.9839 66.8563 18.9247 66.8384 18.8744 66.8045C18.824 66.7707 18.7847 66.7224 18.7615 66.6658C18.7382 66.6092 18.732 66.5469 18.7437 66.4867C18.7555 66.4266 18.7845 66.3713 18.8272 66.328C18.8699 66.2846 18.9244 66.2551 18.9836 66.2432C19.0429 66.2313 19.1043 66.2376 19.16 66.2612C19.2158 66.2848 19.2633 66.3247 19.2967 66.3758C19.3301 66.4269 19.3477 66.487 19.3474 66.5483C19.347 66.6298 19.3149 66.7078 19.2582 66.7654C19.2014 66.823 19.1245 66.8556 19.0443 66.856ZM26.0166 67.0888C24.7011 66.8104 23.367 66.6313 22.0254 66.5531C23.367 66.4748 24.7011 66.2957 26.0166 66.0173L25.3145 66.5531L26.0166 67.0888Z" fill="#7A7016"/>
              <path d="M26.9352 67.163C26.8159 67.163 26.6993 67.1271 26.6001 67.0598C26.5009 66.9925 26.4236 66.8969 26.3779 66.785C26.3323 66.6732 26.3203 66.5501 26.3436 66.4313C26.3669 66.3125 26.4243 66.2034 26.5087 66.1178C26.593 66.0322 26.7005 65.9739 26.8175 65.9502C26.9345 65.9266 27.0558 65.9387 27.166 65.9851C27.2762 66.0314 27.3704 66.1099 27.4367 66.2106C27.503 66.3113 27.5383 66.4296 27.5383 66.5507C27.5379 66.713 27.4742 66.8685 27.3612 66.9832C27.2482 67.0979 27.095 67.1626 26.9352 67.163ZM26.9352 66.1107C26.8494 66.1107 26.7656 66.1365 26.6943 66.1848C26.623 66.2332 26.5675 66.3019 26.5347 66.3823C26.5019 66.4627 26.4933 66.5512 26.51 66.6366C26.5267 66.722 26.568 66.8004 26.6286 66.8619C26.6893 66.9235 26.7665 66.9654 26.8506 66.9823C26.9347 66.9993 27.0219 66.9906 27.1011 66.9573C27.1803 66.924 27.248 66.8676 27.2956 66.7952C27.3433 66.7229 27.3687 66.6378 27.3687 66.5507C27.3683 66.4342 27.3225 66.3225 27.2413 66.24C27.1601 66.1576 27.05 66.1111 26.9352 66.1107Z" fill="#7A7016"/>
              <path d="M50.7716 66.0668C50.6589 66.0652 50.5494 66.1048 50.4629 66.1782C50.3765 66.2516 50.3188 66.3541 50.3004 66.467C45.9386 66.4558 43.4647 65.7606 43.4396 65.7542L43.0029 65.6299L44.2139 66.5531L43.0029 67.4778L43.4396 67.3519C43.4647 67.3519 45.937 66.6503 50.302 66.6408C50.3197 66.729 50.3617 66.8104 50.423 66.8755C50.4844 66.9406 50.5626 66.9869 50.6486 67.0088C50.7347 67.0308 50.8251 67.0277 50.9095 66.9998C50.9939 66.9719 51.0688 66.9204 51.1256 66.8512C51.1824 66.782 51.2189 66.6979 51.2307 66.6086C51.2425 66.5193 51.2292 66.4285 51.1924 66.3465C51.1555 66.2645 51.0966 66.1948 51.0225 66.1453C50.9483 66.0958 50.8619 66.0686 50.7732 66.0668H50.7716ZM43.8008 67.0888L44.5029 66.5531L43.8008 66.0173C45.1158 66.2959 46.4493 66.475 47.7904 66.5531C46.4493 66.6312 45.1158 66.8102 43.8008 67.0888ZM50.7716 66.856C50.7112 66.8563 50.6521 66.8384 50.6017 66.8045C50.5514 66.7707 50.5121 66.7224 50.4888 66.6658C50.4656 66.6092 50.4594 66.5469 50.4711 66.4867C50.4828 66.4266 50.5119 66.3713 50.5546 66.328C50.5973 66.2846 50.6517 66.2551 50.711 66.2432C50.7702 66.2313 50.8316 66.2376 50.8874 66.2612C50.9431 66.2848 50.9907 66.3247 51.0241 66.3758C51.0574 66.4269 51.0751 66.487 51.0748 66.5483C51.0748 66.6299 51.0428 66.7082 50.986 66.7659C50.9291 66.8236 50.852 66.856 50.7716 66.856Z" fill="#7A7016"/>
              <path d="M42.8795 67.163C42.7602 67.163 42.6436 67.1271 42.5444 67.0598C42.4452 66.9925 42.3679 66.8969 42.3223 66.785C42.2766 66.6732 42.2647 66.5501 42.288 66.4313C42.3112 66.3125 42.3687 66.2034 42.453 66.1178C42.5374 66.0322 42.6448 65.9739 42.7618 65.9502C42.8788 65.9266 43.0001 65.9387 43.1103 65.9851C43.2205 66.0314 43.3147 66.1099 43.381 66.2106C43.4473 66.3113 43.4827 66.4296 43.4827 66.5507C43.4822 66.713 43.4186 66.8685 43.3055 66.9832C43.1925 67.0979 43.0394 67.1626 42.8795 67.163ZM42.8795 66.1107C42.7938 66.1107 42.71 66.1365 42.6387 66.1848C42.5674 66.2332 42.5118 66.3019 42.479 66.3823C42.4462 66.4627 42.4376 66.5512 42.4543 66.6366C42.4711 66.722 42.5123 66.8004 42.573 66.8619C42.6336 66.9235 42.7108 66.9654 42.7949 66.9823C42.879 66.9993 42.9662 66.9906 43.0454 66.9573C43.1246 66.924 43.1923 66.8676 43.24 66.7952C43.2876 66.7229 43.313 66.6378 43.313 66.5507C43.3126 66.4342 43.2668 66.3225 43.1856 66.24C43.1044 66.1576 42.9944 66.1111 42.8795 66.1107Z" fill="#7A7016"/>
              <defs>
                <linearGradient id="paint0_linear_2612_2953" x1="8.92345" y1="2.23062" x2="35.6927" y2="82.5383" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#F2E56D"/>
                  <stop offset="0.881879" stop-color="#F2DB12"/>
                </linearGradient>
                <linearGradient id="paint1_linear_2612_2953" x1="34.9061" y1="0" x2="34.9061" y2="87" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#AC9E1D"/>
                  <stop offset="1" stop-color="#857B1E"/>
                </linearGradient>
              </defs>
            </svg>  
                <p
                  class="absolute left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 font-normal leading-none text-[#7A7016] top-[40%] text-[13px]"
                >
                  1
                </p>
              </div>
              <div class="flex mt-[3px] gap-3 pr-6">
                <h4
                  class="font-semibold text-[#7C7C7C] text-[1.25rem] leading-[23px]"
                >
                  ${questStartData?.Question}
                </h4>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="pb-6">
        <div
          class="flex items-start ml-[3.25rem] mr-[1.3rem] laptop:ml-[3.67rem]"
        ></div>
        <h4
          class="text-center font-normal text-[#85898C] max-h-[40px] min-h-[40px] text-[1rem]"
        >
          ​
        </h4>
        <div class="flex flex-col gap-[10px]">
          <div class="relative flex flex-col gap-[10px]">
            <div class="flex items-center pl-[3.94rem] pr-[6.3rem]">
              <div
                class="flex items-center justify-center bg-[#DEE6F7] h-[49px] rounded-l-[10px] w-[25px] min-w-[25px]"
              >
                ​
              </div>
              <div
                class="flex w-full justify-between border-[#DEE6F7] bg-white rounded-r-[10px] border-y-[3px] border-r-[3px] pointer-events-none"
              >
                <div class="relative flex w-full items-center">
                  <h1
                    class="font-normal leading-none text-[#435059] py-3 pl-[18px] text-[19px]"
                  >
                    Yes
                  </h1>
                </div>
              </div>
            </div>
            <div class="flex items-center pl-[3.94rem] pr-[6.3rem]">
              <div
                class="flex min-w-[12px] items-center justify-center bg-[#DEE6F7] h-[49px] w-[27px] rounded-l-[10px] laptop:w-[25px] laptop:min-w-[25px]"
              >
                ​
              </div>
              <div
                class="flex w-full justify-between border-[#DEE6F7] bg-white rounded-r-[10px] border-y-[3px] border-r-[3px] pointer-events-none"
              >
                <div class="relative flex w-full items-center">
                  <div class="absolute top-0 block bg-[#4DD896] h-[10px]"></div>
                  <h1
                    class="font-normal leading-none text-[#435059] py-3 pl-[18px] text-[19px]"
                  >
                    No
                  </h1>
                </div>
              </div>
            </div>
          </div>
        </div>
        <h4
          class="text-center font-normal text-[#85898C] py-[10px] text-[1rem] leading-[30px]"
        >
          ​
        </h4>
      </div>
      <div
        class="relative flex items-center justify-between border-t-2 border-[#D9D9D9] px-5 py-[0.63rem]"
      >
        <div class="flex items-center gap-[14.36px]">
        <!-- <img src="./post-e.svg" alt="post-e" class="w-full h-[23px]" /> -->
      ${
        questStartData?.moderationRatingCount === 0 ? (
          `<svg
            width="23"
            height="23"
            viewBox="0 0 23 23"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="0.461408"
              y="0.461408"
              width="22.0769"
              height="22.0772"
              rx="2.30704"
              fill="#0FB063"
              stroke="#0F5634"
              stroke-width="0.922816"
            />
            <path
              d="M16.5603 14.0867L16.0436 17.5195H6.18787V16.9658C6.69234 16.9658 7.06762 16.9351 7.3137 16.8736C7.57209 16.7997 7.74435 16.6459 7.83048 16.4122C7.92891 16.1784 7.97813 15.8215 7.97813 15.3417V7.64539C7.97813 7.17783 7.92891 6.82101 7.83048 6.57492C7.74435 6.32884 7.57209 6.16273 7.3137 6.0766C7.06762 5.99047 6.69234 5.94741 6.18787 5.94741V5.39372H15.8774L15.9882 8.42056H15.3976C15.3114 7.80535 15.1761 7.34394 14.9915 7.03633C14.8193 6.71642 14.5301 6.5011 14.1241 6.39036C13.7304 6.27962 13.1521 6.22425 12.3892 6.22425H9.67611V10.9122H11.8355C12.4015 10.9122 12.8321 10.8629 13.1274 10.7645C13.4228 10.6661 13.6258 10.4815 13.7365 10.2108C13.8472 9.94013 13.9026 9.5587 13.9026 9.06653H14.4932V13.3484H13.9026C13.9026 12.8439 13.8472 12.4686 13.7365 12.2226C13.6258 11.9765 13.4228 11.8165 13.1274 11.7427C12.8321 11.6689 12.4015 11.632 11.8355 11.632H9.67611V16.7075H12.057C12.7706 16.7075 13.3428 16.6767 13.7734 16.6152C14.2164 16.5413 14.5609 16.4122 14.807 16.2276C15.0654 16.043 15.2745 15.7785 15.4345 15.434C15.6067 15.0894 15.7852 14.6403 15.9697 14.0867H16.5603Z"
              fill="white"
            />
          </svg>`
        ) : (
          `<svg
            width="36"
            height="35"
            viewBox="0 0 36 35"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="1.2"
              y="0.7"
              width="33.6"
              height="33.6"
              rx="3.5"
              fill="#DB0000"
              stroke="#1E1111"
              stroke-width="1.4"
            />
            <path
              d="M28.492 27H20.96V26.16C21.24 26.16 21.5293 26.1413 21.828 26.104C22.1267 26.0667 22.3787 25.9733 22.584 25.824C22.7893 25.6747 22.892 25.4413 22.892 25.124C22.892 24.9187 22.8547 24.6853 22.78 24.424C22.724 24.144 22.6027 23.7987 22.416 23.388L21.324 20.868H14.156L12.896 23.836C12.8213 24.06 12.7467 24.284 12.672 24.508C12.616 24.7133 12.588 24.9467 12.588 25.208C12.588 25.6 12.7373 25.8613 13.036 25.992C13.3347 26.104 13.8107 26.16 14.464 26.16V27H8.584V26.16C9.10667 26.16 9.52667 26.076 9.844 25.908C10.1613 25.74 10.4693 25.404 10.768 24.9C11.0667 24.3773 11.44 23.584 11.888 22.52L17.824 8.464H18.972L25.608 23.668C26.0187 24.5827 26.4107 25.2267 26.784 25.6C27.176 25.9733 27.7453 26.16 28.492 26.16V27ZM20.904 19.748L17.824 11.908H17.74L14.576 19.748H20.904Z"
              fill="white"
            />
          </svg>`
        )
      }
        
          <h1
            class="relative font-medium text-[#9A9A9A] text-[1.2rem] leading-[1.2rem]"
          >
            ${questStartData?.QuestTopic}
          </h1>
        </div>
        <div
          class="flex h-4 w-fit items-center rounded-[0.625rem] md:h-[1.75rem] gap-2"
        >
        <!--<img
        src="./clock-outline.svg"
        alt="clock"
        class="h-[20.5px] w-[20.4px]"
      />-->

      <svg width="20.4px" height="20.5px" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path id="Vector" d="M8.15784 16.6458C3.7029 16.6458 0.0791016 13.022 0.0791016 8.56702C0.0791016 4.11208 3.7029 0.488281 8.15784 0.488281C12.6128 0.488281 16.2366 4.11208 16.2366 8.56702C16.2366 13.022 12.6121 16.6458 8.15784 16.6458ZM8.15784 1.78088C4.41577 1.78088 1.3717 4.82495 1.3717 8.56702C1.3717 12.3091 4.41577 15.3532 8.15784 15.3532C11.8999 15.3532 14.944 12.3091 14.944 8.56702C14.944 4.82495 11.8993 1.78088 8.15784 1.78088ZM8.10614 9.16162H3.9569C3.78549 9.16162 3.6211 9.09352 3.49989 8.97232C3.37869 8.85112 3.3106 8.68673 3.3106 8.51532C3.3106 8.34391 3.37869 8.17952 3.49989 8.05831C3.6211 7.93711 3.78549 7.86902 3.9569 7.86902H7.45984V3.07348C7.45984 2.90207 7.52793 2.73768 7.64913 2.61648C7.77034 2.49527 7.93473 2.42718 8.10614 2.42718C8.27755 2.42718 8.44194 2.49527 8.56314 2.61648C8.68435 2.73768 8.75244 2.90207 8.75244 3.07348V8.51532C8.75244 8.68673 8.68435 8.85112 8.56314 8.97232C8.44194 9.09352 8.27755 9.16162 8.10614 9.16162Z" fill="#9C9C9C"/>
</svg>
          <h4
            class="whitespace-nowrap font-normal text-[#9C9C9C] text-[1.2rem] leading-[1.2rem]"
          >
            1 day ago
          </h4>
        </div>
      </div>
    </div>
  </body>
</html>

  
  `,
    })
      .then(async () => {
        console.log("The image was created successfully!");

        // Read the image file from the backend directory
        const filePath = `./assets/uploads/images/${imgName}`;
        const fileBuffer = fs.readFileSync(filePath);

        // Upload the file to S3 bucket
        const s3UploadData = await s3ImageUpload({
          fileBuffer,
          fileName: imgName,
        });

        if (!s3UploadData) throw new Error("File not uploaded");

        console.log("s3UploadData", s3UploadData);

        const { imageName, s3Url } = s3UploadData;

        // Delete the file from the backend directory after uploading to S3
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error("Error deleting file:", err);
            return;
          }
          console.log("File deleted successfully");
        });

        console.log(imageName);

        const userQuestSettingUpdate = await UserQuestSetting.findOneAndUpdate(
          { link: req.body.link },
          { image: s3Url },
          { new: true }
        );

        if (!userQuestSettingUpdate)
          throw new Error("userQuestSetting not updated");

        return res.status(200).json({
          success: true,
          imageName: imageName,
          s3Url: s3Url,
          userQuestSetting: userQuestSettingUpdate,
        });
      })
      .catch((error) => {
        console.error("Error generating image:", error);
        return res.status(500).json({
          message: `An error occurred while generating image: ${error.message}`,
        });
      });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: `An error occurred on shaedLinkDynamicImage: ${error.message}`,
    });
  }
};

module.exports = {
  create,
  createOrUpdate,
  update,
  link,
  impression,
  status,
  sharedLinkDynamicImage,
  // get,
};
