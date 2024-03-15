const axios = require("axios");
const { STATEMENT, SYSTEM_MESSAGES } = require("../constants/index");
const { OPEN_AI_KEY, OPEN_AI_URL } = require("../config/env");
const {
  checkViolationInSentence,
  removeCorrected,
  capitalizeFirstLetter,
  removePeriod,
  replaceWithPeriod,
  extractAlphabetic,
  removeQuestionMark,
  removeTrailingPeriods,
  removeTrailingQuestionMarks,
  incrementCounter,
  removeQuotes,
  isAllNumbers,
  createQuestTopic,
  checkNonsenseInTopics,
  numberToWords,
  extractAndSanitizeDollar,
  capitalizeSentence,
  checkTopicMasterArray,
} = require("../service/AiValidation");
const QuestTopics = require("../models/QuestTopics");


const validation = async (req, res) => {
  const callType = req.params.callType;
  if (callType >= 1 && callType <= 7) {
    await handleRequest(
      req,
      res,
      OPEN_AI_URL,
      OPEN_AI_KEY,
      SYSTEM_MESSAGES[callType - 1],
      callType
    );
  } else {
    res.status(400).json({ message: "Invalid call type", status: "ERROR" });
  }
};

async function handleRequest(
  req,
  res,
  OPEN_AI_URL,
  OPEN_AI_KEY,
  SYSTEM_MESSAGES,
  callType
) {
  try {
    const { queryType } = req.query;
    let userMessage = req.query.userMessage;
    // Check if userMessage is empty
    if (!userMessage) {
      res.status(400).json({ message: "Empty Message", status: "ERROR" });
      return;
    }
    // Check if queryType exist for question only
    if (!queryType && callType == 1) {
      res
        .status(400)
        .json({ message: "QueryType Shouldn't be empty", status: "ERROR" });
      return;
    }

    // Replace all the & with and
    if (userMessage.includes("&")) {
      userMessage = userMessage.replace(/&/g, "and");
    }

    if (callType == 1 || callType == 2) {
      userMessage = removeTrailingPeriods(userMessage);
      userMessage = removeTrailingQuestionMarks(userMessage);
    }
    if (callType == 2) {
      isAllNumbers(userMessage) && { message: userMessage, status: "OK" };
    }

    // if(callType == 3) {
    //   userMessage = removeTrailingPeriods(userMessage);
    //   userMessage = removeTrailingQuestionMarks(userMessage);
    //   userMessage = userMessage + "."
    // }

    //  throw new Error("custom");
    const response = await axios.post(
      OPEN_AI_URL,
      {
        model: "gpt-3.5-turbo",
        // model: "gpt-3.5-turbo-1106",
        messages: [
          { role: "system", content: SYSTEM_MESSAGES },
          { role: "user", content: userMessage },
        ],
        temperature: 0,
        max_tokens: 256,
        top_p: 0.001,
        frequency_penalty: 0,
        presence_penalty: 0,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPEN_AI_KEY}`,
        },
      }
    );

    const modifiedResponse = checkResponse(
      response.data,
      userMessage,
      callType,
      req,
      res
    );
    res.json(modifiedResponse);
  } catch (error) {
    handleErrorResponse(res, error);
  }
}

function checkResponse(responseData, userMessage, callType, req, res) {
  let filtered = responseData.choices[0].message.content;
  console.log("🚀 ~ checkResponse ~ filtered:", filtered)
  let status = "OK";

  let found;
  if (callType == 2) {
    filtered = removeQuotes(filtered);
  }

  found = checkViolationInSentence(filtered);

  if (found) {
    incrementCounter(req, res, {
      userMessage,
      responseChatGPT: filtered,
      status: "VIOLATION",
    });
    filtered = userMessage;
    status = "VIOLATION";
  }

  if (callType == 2) {
    filtered = removeCorrected(filtered);
    if (filtered == "Correct.") filtered = userMessage;
    filtered = capitalizeFirstLetter(filtered);
    filtered = removeTrailingPeriods(filtered);
    filtered = removeTrailingQuestionMarks(filtered);
    filtered = extractAndSanitizeDollar(filtered);
    filtered = numberToWords(filtered)
  }

  if (callType == 3) {
    filtered = removeTrailingPeriods(filtered);
    filtered = capitalizeSentence(filtered);
    filtered = checkTopicMasterArray(filtered);
    const found = checkNonsenseInTopics(filtered);
    if (found) {
      filtered = userMessage;
      status = "FAIL";
    } else {
      createQuestTopic(filtered);
    }
  }

  return { message: filtered, status: status };
}

function handleErrorResponse(res, error) {
  if (error.response) {
    const { status, data } = error.response;
    const message = status === 400 ? "Bad Request" : data;
    return res.status(status).json({ message: message, status: "ERROR" });
  }

  if (error.request) {
    return res
      .status(500)
      .json({ message: "No GPT Response", status: "ERROR" });
  }

  return res
    .status(500)
    .json({ message: "GPT Request Error", status: "ERROR" });
}

// new
function checkNonsenseInSentence(sentence) {
  const statements = [
    "clarify your request",
    "contain any standard english",
    "correct gibberish",
    "make sense in any language",
    "no alphabetic characters were found",
    "not a recognized word",
    "provide a clear statement or question",
    "provide a valid email address",
    "provide a valid sentence",
    "provide more context",
    "provide more information",
    "understand the provided statement",
    "understand the provided words",
    "understand the statement you provided",
    "understand the text you provided",
    "understand what you are trying to say",
    "understand what you're trying to say",
    "understand your message",
    "phrase for me to correct",
  ];

  const lowerCaseSentence = sentence.toLowerCase();
  return statements.some((statement) =>
    lowerCaseSentence.includes(statement.toLowerCase())
  );
}

module.exports = {
  validation,
};
