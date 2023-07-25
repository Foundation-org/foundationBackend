const route = require("express").Router();

const InfoQuestQuestions = require("../models/InfoQuestQuestions");
const StartQuests = require("../models/StartQuests");

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
      let AnswerAddedOrNot = "";
      req.body.changeAnswerAddedObj.selected.map((option) => {
        if (option.addedAnswerByUser === true) {
          // AnswerAddedOrNot = option.question;
          const addAnswer = {
            question: option.question,
            selected: true
          }
          InfoQuestQuestions.findByIdAndUpdate(
            { _id: req.body.questId },
            { $push: { QuestAnswers: addAnswer } },

          ).exec(),
            (err, data) => {
              if (err) {
                return res.status(500).send(err);
              } else {
                return res.status(200).send(data);
              }
            };
        }
      });

      responseMsg = "Updated";
      // console.log(startQuestAnswersSelected);
      startQuestAnswersSelected.push(req.body.changeAnswerAddedObj);
      // console.log(startQuestAnswersSelected);

      await StartQuests.findByIdAndUpdate(
        { _id: startQuestQuestion._id },
        { data: startQuestAnswersSelected, addedAnswer: AnswerAddedOrNot },
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
    res.status(500).send("Not Created 2");
  }
});
route.post("/getStartQuestPercent", async (req, res) => {
  try {
    const StartQuestsData = await StartQuests.find({
      questForeignKey: req.body.questForeignKey,
      // questForeignKey: "64a6d5a9313105966b9682f2",
    });
    // console.log("StartQuestsData", StartQuestsData);

    let startQuestWithNagativeAns = 0,
      startQuestWithPositiveAns = 0; //length of total length
    let startQuestWithNagativeConAns = 0,
      startQuestWithPositiveConAns = 0;
    const selectedOptionsCount = {}; // Object to store the count of each option
    const contendedOptionsCount = {}; // Object to store the count of each option
    let totalSelectedResponses = 0;
    let totalContendedResponses = 0;
    let questype;

    ``
    const mapExecution = StartQuestsData.map(async (res) => {
      if (typeof res.data[res.data.length - 1].selected === "string") {
        questype = 1;
        if (
          res.data[res.data.length - 1].selected === "Yes" ||
          res.data[res.data.length - 1].selected === "Agree"
        ) {
          startQuestWithPositiveAns += 1;
          if (res.data[res.data.length - 1].contended === "Yes" ||
            res.data[res.data.length - 1].contended === "Agree") {
            startQuestWithPositiveConAns += 1;

          }
          else if (res.data[res.data.length - 1].contended === "No" ||
            res.data[res.data.length - 1].contended === "Disagree") {
            startQuestWithNagativeConAns += 1;

          }
        } else if (
          res.data[res.data.length - 1].selected === "No" ||
          res.data[res.data.length - 1].selected === "Disagree"
        ) {
          startQuestWithNagativeAns += 1;
          if (res.data[res.data.length - 1].contended === "No" ||
            res.data[res.data.length - 1].contended === "Disagree") {
            startQuestWithNagativeConAns += 1;

          }
          else if (res.data[res.data.length - 1].contended === "Yes" ||
            res.data[res.data.length - 1].contended === "Agree") {
            startQuestWithPositiveConAns += 1;

          }


        }
      } else {

        if (res.data[res.data.length - 1].selected) {
          res.data[res.data.length - 1].selected.map((option) => {
            if (selectedOptionsCount[option.question]) {
              selectedOptionsCount[option.question]++;
            }
            else if (selectedOptionsCount[option.question] === 0) {
              selectedOptionsCount[option.question] = 1;
            }
            else {
              selectedOptionsCount[option.question] = 1;
            }

            // console.log(selectedOptionsCount[option.question] + " " + option.question);


          })
          totalSelectedResponses++;

        }
        console.log("Total Selected responses :" + totalSelectedResponses);

        if (res.data[res.data.length - 1].contended) {
          res.data[res.data.length - 1].contended.map((option) => {
            if (contendedOptionsCount[option.question]) {
              contendedOptionsCount[option.question]++;
            }
            else if (contendedOptionsCount[option.question] === 0) {
              contendedOptionsCount[option.question] = 1;
            }
            else {
              contendedOptionsCount[option.question] = 1;
            }

            // console.log(selectedOptionsCount[option.question] + " " + option.question);


          })
          totalContendedResponses++;

        }
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
      if (questype == 1) {
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

        let TotalNumberOfConAns =
          startQuestWithPositiveConAns + startQuestWithNagativeConAns;
        console.log("TotalNumberOfConAns", TotalNumberOfConAns);

        let percentageOfYesConAns =
          startQuestWithPositiveConAns === 0
            ? 0
            : (startQuestWithPositiveConAns * 100) / TotalNumberOfConAns;
        console.log("startQuestWithPositiveConAns", percentageOfYesConAns);

        let percentageOfNoConAns =
          startQuestWithNagativeConAns === 0
            ? 0
            : (startQuestWithNagativeConAns * 100) / TotalNumberOfConAns;

        const responseObj = {
          selectedPercentage: {
            Yes: percentageOfYesAns === NaN ? 0 : percentageOfYesAns,
            No: percentageOfNoAns === NaN ? 0 : percentageOfNoAns
          },
          contendedPercentage: {
            Yes: percentageOfYesConAns === NaN ? 0 : percentageOfYesConAns,
            No: percentageOfNoConAns === NaN ? 0 : percentageOfNoConAns
          },
        }

        res
          .status(200)
          .json([responseObj

          ]);

      }
      else {
        const percentageOfSelectedOptions = {};
        const percentageOfContendedOptions = {};

        // Calculate the percentage for each option
        for (const option in selectedOptionsCount) {
          const percentage = (selectedOptionsCount[option] / totalSelectedResponses) * 100;

          percentageOfSelectedOptions[option] = isNaN(percentage) ? 0 : Number(percentage.toFixed(2));

        }

        for (const option in contendedOptionsCount) {
          const percentage = (contendedOptionsCount[option] / totalContendedResponses) * 100;
          Number(percentage.toFixed(2));
          percentageOfContendedOptions[option] = isNaN(percentage) ? 0 : Number(percentage.toFixed(2));

        }

        const responseObj = {
          selectedPercentage: percentageOfSelectedOptions,
          contendedPercentage: percentageOfContendedOptions,
        }
        res.status(200).json([responseObj

        ]);
      }



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
