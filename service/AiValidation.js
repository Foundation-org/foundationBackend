const { STATEMENT } = require("../constants");
const User = require("../models/UserModel");
const crypto = require("crypto");
const { createLedger } = require("../utils/createLedger");
const QuestTopics = require("../models/QuestTopics");


module.exports.checkViolationInSentence = (sentence) => {
  const lowerCaseSentence = sentence.toLowerCase();
  return STATEMENT.some((statement) =>
    lowerCaseSentence.includes(statement.toLowerCase())
  );
};

module.exports.capitalizeFirstLetter = (sentence) => {
  if (sentence.length === 0) {
    return sentence;
  }

  const firstLetter = sentence.charAt(0).toUpperCase();
  const restOfSentence = sentence.slice(1);

  return firstLetter + restOfSentence;
};


module.exports.removeTrailingPeriods = (sentence) => {
  const regex = /\.*$/;
  return sentence.replace(regex, "");
};

module.exports.removeCorrected = (inputString) => {
  const regex = /Corrected: /gi;
  return inputString.replace(regex, "");
};


module.exports.replaceWithPeriod = (inputString) => {
  console.log(": AiValidation.js:43 ~ inputString:", inputString)
  // Use a regular expression to check the last character
  const regex = /[^\s.]$/;
  
  // If the last character is not a period or whitespace, add a period
  if (regex.test(inputString)) {
    return inputString + '.';
  }
  
  // Otherwise, return the input string as is
  return inputString;
}


module.exports.extractAlphabetic = (inputString) => {
  // Use a regular expression to match alphabetic characters
  const alphabeticCharacters = inputString.match(/[a-zA-Z]+/g);

  // Check if alphabetic characters are found
  if (alphabeticCharacters) {
    const resultString = alphabeticCharacters.join(''); // Join the matched characters
    return resultString;
  } else {
    return "No alphabetic characters found";
  }
}



module.exports.removeTrailingQuestionMarks = (sentence) => {
  const regex = /\?*$/;
  return sentence.replace(regex, "");
};

module.exports.incrementCounter = async(req, res, data) => {
  try {
    const result = await User.updateOne(
      { uuid: req.user.uuid },
      { $inc: { violationCounter: 1 } }
      );
    if (result?.nModified === 0) {
      return res.status(404).send("User not found");
    }
    // Create Ledger
    await createLedger(
    {
      uuid : req.user.uuid,
      txUserAction : "violationCoC",
      txID : crypto.randomBytes(11).toString("hex"),
      txAuth : "User",
      txFrom : req.user.uuid,
      txTo : "dao",
      txAmount : "0",
      txData : data,
      // txDescription : "User triggered a CoC violation"
    })
    // return res.status(200).send(result);
    return res.status(200);
  } catch (error) {
    return res.status(500);
  }
};

module.exports.removeQuotes = (sentence) => {
  if (sentence.startsWith('"') && sentence.endsWith('"')) {
      return sentence.slice(1, -1);
  }
  return sentence;
}

module.exports.isAllNumbers = (input) => {
  return /^\d+$/.test(input);
}

module.exports.createQuestTopic = async(topic) => {
  try {
    const checkQuestTopic = await QuestTopics.findOne({ name: topic })
    if(checkQuestTopic) return
    const questTopic = await new QuestTopics({ name: topic })
    await questTopic.save()
  } catch (error) {
    console.log(error);
  }
}