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
    //       uuid: req.body.uuid,
    //     },
    //   }
    // )

    // await StartQuests.updateOne(
    //   {
    //     btnStatus: "completed",
    //   },
    //   {
    //     where: {
    //       uuid: req.body.uuid,
    //     },
    //   }
    // );

    const question = await new StartQuests({
      questForeignKey: req.body.questForeignKey,
      uuid: req.body.uuid,
      addedAnswer: req.body.addedAnswer,
      data: req.body.data,
    });

    const questions = await question.save();
    !questions && res.status(404).send("Not Created 1");

    if (req.body.addedAnswer !== "") {
      InfoQuestQuestions.findByIdAndUpdate(
        { _id: req.body.questForeignKey },
        {
          $push: {
            QuestAnswers: {
              question: req.body.addedAnswer,
              selected: true,
            },
          },
        }
      ).exec(),
        (err, data) => {
          if (err) {
            return res.status(500).send(err);
          } else {
            return res.status(200).send(data);
          }
        };
    }

    res.status(200).json("Updated");

    // const questions = await question.save();
    // !questions && res.status(404).send("Not Created 1");

    // res.status(201).send("Quest has been Created");
  } catch (err) {
    res.status(500).send("Not Created 2");
  }
});
route.post("/updateChangeAnsStartQuest", async (req, res) => {
  try {
    const startQuestQuestion = await StartQuests.findOne({
      questForeignKey: req.body.questId,
      uuid: req.body.uuid,
    });

    let startQuestAnswersSelected = startQuestQuestion.data;
    console.log(
      "startQuestQuestion.data",
      startQuestQuestion.data[startQuestQuestion.data.length - 1]
    );
    console.log(
      "req.body.changeAnswerAddedObj ",
      req.body.changeAnswerAddedObj
    );
    let responseMsg = "";

    let timeWhenUserUpdated = new Date(
      startQuestQuestion.data[startQuestQuestion.data.length - 1].created
    );

    let date1 = new Date();
    let date2 = date1.getTime();

    let dateFinal = date2 - timeWhenUserUpdated.getTime();

    console.log("dateFinal", dateFinal);

    if (dateFinal > 3600000) {
      if (
        Compare(
          startQuestQuestion.data[startQuestQuestion.data.length - 1],
          req.body.changeAnswerAddedObj
        )
      ) {
        //Comparing old and new answer

        let AnswerAddedOrNot = startQuestQuestion.addedAnswerByUser;

        if (typeof req.body.changeAnswerAddedObj.selected !== "string") {
          req.body.changeAnswerAddedObj.selected.map((option) => {
            if (option.addedAnswerByUser === true) {
              AnswerAddedOrNot = option.question;
              const addAnswer = {
                question: option.question,
                someOneAdded: true,
                // selected: true,
              };
              InfoQuestQuestions.findByIdAndUpdate(
                { _id: req.body.questId },
                { $push: { QuestAnswers: addAnswer } }
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
        }

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
        responseMsg = "Answer has not changed";
      }
    } else {
      console.log("You can change your answer once every 1 hour");
      responseMsg = "You can change your answer once every 1 hour";
    }

    res.status(200).json(responseMsg);
  } catch (err) {
    res.status(500).send("Not Created 2");
  }

  function Compare(obj1, obj2) {
    // Clone the objects to prevent modifying the original objects
    const clonedObj1 = { ...obj1 };
    const clonedObj2 = { ...obj2 };

    // Remove the 'created' property from the cloned objects as it can be different
    delete clonedObj1.created;
    delete clonedObj2.created;

    // Convert the modified objects to JSON strings and compare them
    const stringifiedObj1 = JSON.stringify(clonedObj1);
    const stringifiedObj2 = JSON.stringify(clonedObj2);

    // Compare the JSON strings
    if (stringifiedObj1 === stringifiedObj2) {
      return false; // Objects match
    } else {
      return true; // Objects do not match
    }
  }
});

// route.post("/updateChangeAnsStartQuest", async (req, res) => {
//   try {
//     const startQuestQuestion = await StartQuests.findOne({
//       questForeignKey: req.body.questId,
//       uuid: req.body.uuid,
//     });

//     let startQuestAnswersSelected = startQuestQuestion.data;
//     console.log("startQuestQuestion.data", startQuestQuestion.data);
//     let responseMsg = "";

//     let timeWhenUserUpdated = new Date(
//       startQuestQuestion.data[startQuestQuestion.data.length - 1].created
//     );

//     let date1 = new Date();
//     let date2 = date1.getTime();

//     let dateFinal = date2 - timeWhenUserUpdated.getTime();

//     console.log("dateFinal", dateFinal);

//     if (dateFinal > 3600000) {
//       let AnswerAddedOrNot = startQuestQuestion.addedAnswerByUser;

//       console.log(req.body.changeAnswerAddedObj.selected);
//       console.log(startQuestAnswersSelected);
//       console.log(JSON.stringify(startQuestAnswersSelected));

//       // Check if the new answer is different from the existing answer
//       if (
//         typeof req.body.changeAnswerAddedObj.selected !== "string" &&
//         JSON.stringify(
//           req.body.changeAnswerAddedObj.selected.toLowerCase().trim()
//         ) !== JSON.stringify(startQuestAnswersSelected.toLowerCase().trim())
//       ) {
//         if (typeof req.body.changeAnswerAddedObj.selected !== "string") {
//           req.body.changeAnswerAddedObj.selected.map((option) => {
//             if (option.addedAnswerByUser === true) {
//               AnswerAddedOrNot = option.question;
//               const addAnswer = {
//                 question: option.question,
//                 selected: true,
//               };
//               InfoQuestQuestions.findByIdAndUpdate(
//                 { _id: req.body.questId },
//                 { $push: { QuestAnswers: addAnswer } }
//               ).exec(),
//                 (err, data) => {
//                   if (err) {
//                     return res.status(500).send(err);
//                   } else {
//                     return res.status(200).send(data);
//                   }
//                 };
//             }
//           });
//         }

//         responseMsg = "Updated";
//         startQuestAnswersSelected.push(req.body.changeAnswerAddedObj);

//         await StartQuests.findByIdAndUpdate(
//           { _id: startQuestQuestion._id },
//           { data: startQuestAnswersSelected, addedAnswer: AnswerAddedOrNot },
//           { upsert: true }
//         ).exec(),
//           (err, data) => {
//             if (err) {
//               return res.status(500).send(err);
//             } else {
//               return res.status(200).send(data);
//             }
//           };
//       } else {
//         // Answer has not changed
//         console.log("Answer has not changed");
//         responseMsg = "Answer has not changed";
//       }
//     } else {
//       console.log("You can change your answer once every 1 hour");
//       responseMsg = "You can change your answer once every 1 hour";
//     }

//     res.status(200).json(responseMsg);
//   } catch (err) {
//     res.status(500).send("Not Created 2");
//   }
// });

route.post("/getRankedQuestPercent", async (req, res) => {
  try {
    const StartQuestsData = await StartQuests.find({
      questForeignKey: req.body.questForeignKey,
    });
    const optionsCount = {};
    let totalCount = 0;
    const mapExecution = StartQuestsData.map(async (res) => {
      let i = 1;

      res.data[res.data.length - 1].selected.map((option) => {
        const question = option.question.trim();
        if (optionsCount[question]) {
          optionsCount[question] +=
            res.data[res.data.length - 1].selected.length - i;
          console.log("selected option" + optionsCount[question]);
          console.log(question);
        } else {
          optionsCount[question] =
            res.data[res.data.length - 1].selected.length - i;
          console.log("selected option first" + optionsCount[question]);
          console.log(question);
        }
        totalCount += res.data[res.data.length - 1].selected.length - i;
        i++;
        console.log("Total responses :" + totalCount);
      });
    });

    return Promise.all(mapExecution).then(() => {
      const percentageOfOptions = {};

      for (const option in optionsCount) {
        const percentage = (optionsCount[option] / totalCount) * 100;

        percentageOfOptions[option] = isNaN(percentage)
          ? 0
          : Number(Math.round(percentage));
      }

      const responseObj = {
        rankedPercentage: percentageOfOptions,
      };
      res.status(200).json([responseObj]);
    });
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

    const mapExecution = StartQuestsData.map(async (res) => {
      if (typeof res.data[res.data.length - 1].selected === "string") {
        questype = 1;
        if (
          res.data[res.data.length - 1].selected === "Yes" ||
          res.data[res.data.length - 1].selected === "Agree"
        ) {
          startQuestWithPositiveAns += 1;
          if (
            res.data[res.data.length - 1].contended === "Yes" ||
            res.data[res.data.length - 1].contended === "Agree"
          ) {
            startQuestWithPositiveConAns += 1;
          } else if (
            res.data[res.data.length - 1].contended === "No" ||
            res.data[res.data.length - 1].contended === "Disagree"
          ) {
            startQuestWithNagativeConAns += 1;
          }
        } else if (
          res.data[res.data.length - 1].selected === "No" ||
          res.data[res.data.length - 1].selected === "Disagree"
        ) {
          startQuestWithNagativeAns += 1;
          if (
            res.data[res.data.length - 1].contended === "No" ||
            res.data[res.data.length - 1].contended === "Disagree"
          ) {
            startQuestWithNagativeConAns += 1;
          } else if (
            res.data[res.data.length - 1].contended === "Yes" ||
            res.data[res.data.length - 1].contended === "Agree"
          ) {
            startQuestWithPositiveConAns += 1;
          }
        }
      } else {
        if (res.data[res.data.length - 1].selected) {
          res.data[res.data.length - 1].selected.map((option) => {
            const question = option.question.trim();
            if (selectedOptionsCount[question]) {
              selectedOptionsCount[question]++;
              console.log("selected option" + selectedOptionsCount[question]);
              console.log(question);
            } else {
              selectedOptionsCount[question] = 1;
              console.log(
                "selected option first" + selectedOptionsCount[question]
              );
              console.log(question);
            }
          });
          totalSelectedResponses++;
        }
        console.log("Total Selected responses :" + totalSelectedResponses);

        if (res.data[res.data.length - 1].contended) {
          res.data[res.data.length - 1].contended.map((option) => {
            const question = option.question.trim();
            if (contendedOptionsCount[question]) {
              contendedOptionsCount[question]++;
              console.log("contended option" + contendedOptionsCount[question]);
              console.log(question);
            } else {
              contendedOptionsCount[question] = 1;
              console.log(
                "First contended option" + contendedOptionsCount[question]
              );
              console.log(question);
            }
          });
          totalContendedResponses++;
        }
        console.log("Total Contended responses :" + totalContendedResponses);
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
      if (questype === 1) {
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
            No: percentageOfNoAns === NaN ? 0 : percentageOfNoAns,
          },
          contendedPercentage: {
            Yes: percentageOfYesConAns === NaN ? 0 : percentageOfYesConAns,
            No: percentageOfNoConAns === NaN ? 0 : percentageOfNoConAns,
          },
        };

        res.status(200).json([responseObj]);
      } else {
        const percentageOfSelectedOptions = {};
        const percentageOfContendedOptions = {};
        let responses;
        if (totalSelectedResponses > totalContendedResponses) {
          responses = totalSelectedResponses;
        } else {
          responses = totalContendedResponses;
        }
        // Calculate the percentage for each option
        for (const option in selectedOptionsCount) {
          const percentage = (selectedOptionsCount[option] / responses) * 100;

          percentageOfSelectedOptions[option] = isNaN(percentage)
            ? 0
            : Number(Math.round(percentage));
        }

        for (const option in contendedOptionsCount) {
          const percentage = (contendedOptionsCount[option] / responses) * 100;
          Number(Math.round(percentage));
          percentageOfContendedOptions[option] = isNaN(percentage)
            ? 0
            : Number(Math.round(percentage));
        }

        const responseObj = {
          selectedPercentage: percentageOfSelectedOptions,
          contendedPercentage: percentageOfContendedOptions,
        };
        res.status(200).json([responseObj]);
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
      uuid: req.body.uuid,
    });

    res.status(200).json(startQuestQuestion);
  } catch (err) {
    res.status(500).send("Not Created 2");
  }
});
module.exports = route;
