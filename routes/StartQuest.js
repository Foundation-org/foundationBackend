const route = require("express").Router();

const StartQuests = require("../models/StartQuests");
// const InfoQuestQuestions = require("../models/InfoQuestQuestions");

// SIGN UP
route.post("/createStartQuest", async (req, res) => {
  try {
    // const updateQuestion = await InfoQuestQuestions.StartQuests(
    //   {
    //     btnStatus: "completed",
    //   },
    //   {
    //     where: {
    //       walletAddr: req.body.walletAddr,
    //     },
    //   }
    // )

    await StartQuests.updateOne(
      {
        btnStatus: "completed",
      },
      {
        where: {
          walletAddr: req.body.walletAddr,
        },
      }
    );

    const question = await new StartQuests({
      questForeignKey: req.body.questForeignKey,
      walletAddr: req.body.walletAddr,
      addedAnswer: req.body.addedAnswer,
      // correctAnswer: req.body.correctAnswer,
      data: req.body.data,
    });

    console.log(req.body.addedAnswer);

    const questions = await question.save();
    !questions && res.status(404).send("Not Created 1");

    res.status(201).send("Quest has been Created");
  } catch (err) {
    res.status(500).send("Not Created 2");
  }
});

route.post("/updateChangeAnsStartQuest", async (req, res) => {
  try {
    const startQuestQuestion = await StartQuests.findOne({
      questForeignKey: req.body.questId,
      walletAddr: req.body.walletAddr,
    });

    let startQuestAnswersSelected = startQuestQuestion.data;
    console.log("startQuestQuestion.data", startQuestQuestion.data);
    let responseMsg = "";

    let timeWhenUserUpdated = new Date(
      startQuestQuestion.data[startQuestQuestion.data.length - 1].created
    );

    let date1 = new Date();
    let date2 = date1.getTime();

    let dateFinal = date2 - timeWhenUserUpdated.getTime();

    console.log("dateFinal", dateFinal);

    if (dateFinal > 86400000) {
      responseMsg = "Updated";
      console.log(startQuestAnswersSelected);
      startQuestAnswersSelected.push(req.body.changeAnswerAddedObj);
      console.log(startQuestAnswersSelected);

      await StartQuests.findByIdAndUpdate(
        { _id: startQuestQuestion._id },
        { data: startQuestAnswersSelected },
        { upsert: true }
      ).exec(),
        (err, data) => {
          if (err) {
            return res.status(500).send(err);
          } else {
            return res.status(200).send(data);
          }
        };
    } else {
      console.log("Wait 24 hours to update answer");
      responseMsg = "Wait 24 hours to update answer";
    }

    res.status(200).json(responseMsg);
  } catch (err) {
    res.status(500).send("Not Created 2");
  }
});

route.post("/getStartQuestPercent", async (req, res) => {
  try {
    const StartQuestsData = await StartQuests.find({
      questForeignKey: req.body.questForeignKey,
      // questForeignKey: "64a6d5a9313105966b9682f2",
    });
    console.log("StartQuestsData", StartQuestsData);

    let startQuestWithNagativeAns = 0,
      startQuestWithPositiveAns = 0; //length of total length

    const mapExecution = StartQuestsData.map(async (res) => {
      if (typeof res.data[res.data.length - 1].selected === "string") {
        if (
          res.data[res.data.length - 1].selected === "Yes" ||
          res.data[res.data.length - 1].selected === "Agree"
        ) {
          startQuestWithPositiveAns += 1;
        } else if (
          res.data[res.data.length - 1].selected === "No" ||
          res.data[res.data.length - 1].selected === "Disagree"
        ) {
          startQuestWithNagativeAns += 1;
        }
      } else {
        const userRecordOfQuest = await StartQuests.findOne({
          questForeignKey: req.body.questForeignKey,
          walletAddr: req.body.walletAddr,
        });
        console.log(
          "userRecordOfQuest",
          userRecordOfQuest.data[userRecordOfQuest.data.length - 1].selected
        );
        userRecordOfQuest.data[userRecordOfQuest.data.length - 1].selected.map((rc) => {
          console.log(rc.question);

          let selectedData = res.data[0].selected;
          let contendedData = res.data[0].contended;
  
          console.log("Selected: ", selectedData);
          console.log("Contended: ", contendedData);

        });
      }
    });

    // let ownCreatedIds = [];

    // StartQuestsData.map(function (rc) {
    //   ownCreatedIds.push(rc._id);
    // });

    // console.log("ownCreatedIds", ownCreatedIds);

    // const mapExecution = ownCreatedIds.map(async function (rc) {
    //   await StartQuests.findOne({
    //     _id: rc.toString(),
    //   }).then((res) => {
    //     console.log("res", res);

    //     if (typeof res.data[res.data.length - 1].selected === "string") {
    //       if (res.data[res.data.length - 1].selected === "Yes" || res.data[res.data.length - 1].selected === "Agree") {
    //         startQuestWithPositiveAns += 1;
    //       } else if (res.data[res.data.length - 1].selected === "No" || res.data[res.data.length - 1].selected === "Disagree") {
    //         startQuestWithNagativeAns += 1;
    //       }
    //     } else {
    //     console.log("res.data", res.data[0]);
    //   }
    //   });
    // });
    return Promise.all(mapExecution).then(() => {
      let TotalNumberOfAns =
        startQuestWithPositiveAns + startQuestWithNagativeAns;
      console.log("TotalNumberOfAns", TotalNumberOfAns);

      let percentageOfYesAns =
        startQuestWithPositiveAns === 0
          ? 0
          : (startQuestWithPositiveAns * 100) / TotalNumberOfAns;
      console.log("startQuestWithPositiveAns", percentageOfYesAns);

      let percentageOfNoAns =
        startQuestWithNagativeAns === 0
          ? 0
          : (startQuestWithNagativeAns * 100) / TotalNumberOfAns;
      console.log("startQuestWithNagativeAns", percentageOfNoAns);

      res
        .status(200)
        .json([
          { Yes: percentageOfYesAns === NaN ? 0 : percentageOfYesAns },
          { No: percentageOfNoAns === NaN ? 0 : percentageOfNoAns },
        ]);
    });
  } catch (err) {
    res.status(500).send("Not Created 2");
  }
});

route.post("/getStartQuestInfo", async (req, res) => {
  try {
    const startQuestQuestion = await StartQuests.findOne({
      questForeignKey: req.body.questForeignKey,
      walletAddr: req.body.walletAddr,
    });

    res.status(200).json(startQuestQuestion);
  } catch (err) {
    res.status(500).send("Not Created 2");
  }
});
module.exports = route;
