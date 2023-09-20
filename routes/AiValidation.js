const axios = require("axios");
const {
  removeCorrected,
  checkViolationInSentence,
  capitalizeFirstLetter,
  removePeriod,
} = require("../service/AiValidation");
const { SYSTEM_MESSAGES } = require("../constants");
const { OPEN_AI_URL, OPEN_AI_KEY } = require("../config/env");

const route = require("express").Router();

const minApiCallDelay = 3000; // 1 call allowed every 3 seconds;
const maxApiCallsPerDay = 2200; // total calls per oneDayInMillis
const oneDayInMillis = 24 * 60 * 60 * 1000; // 24hr period

let lastApiCallTimestamp = 0;
let apiCallCount = 0;

route.get("/:callType", async (req, res) => {
  const callType = req.params.callType;
  if (callType >= 1 && callType <= 3) {
    const now = Date.now();
    const timeSinceLastCall = now - lastApiCallTimestamp;

    if (timeSinceLastCall < minApiCallDelay) {
      const delay = minApiCallDelay - timeSinceLastCall;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    if (apiCallCount >= maxApiCallsPerDay) {
      res.status(429).json({ message: "API Limit", status: "ERROR" });
      return;
    }

    lastApiCallTimestamp = Date.now();
    apiCallCount++;

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
});

async function handleRequest(
  req,
  res,
  OPEN_AI_URL,
  OPEN_AI_KEY,
  SYSTEM_MESSAGES,
  callType
) {
  try {
    const userMessage = req.query.userMessage;

    if (!userMessage) {
      res.status(400).json({ message: "Empty Message", status: "ERROR" });
      return;
    }

    const response = await axios.post(
      OPEN_AI_URL,
      {
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: SYSTEM_MESSAGES },
          { role: "user", content: userMessage },
        ],
        temperature: 0,
        max_tokens: 256,
        top_p: 1,
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
      callType
    );
    res.json(modifiedResponse);
  } catch (error) {
    handleErrorResponse(res, error);
  }
}

function checkResponse(responseData, userMessage, callType) {
  let filtered = responseData.choices[0].message.content;
  let status = "OK";

  const found = checkViolationInSentence(filtered);

  if (found) {
    filtered = userMessage;
    status = "VIOLATION";
  }

  if (callType == 2) {
    filtered = removeCorrected(filtered);
    if (filtered == "Correct.") filtered = userMessage;
    filtered = capitalizeFirstLetter(filtered);
    filtered = removePeriod(filtered);
  }

  if (callType == 3) {
    if (filtered == "No.") status = "FAIL";
    filtered = userMessage;
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

function checkResponse(responseData, userMessage, callType) {
  let filtered = responseData.choices[0].message.content;
  let status = "OK";

  const found = checkViolationInSentence(filtered);

  if (found) {
    filtered = userMessage;
    status = "VIOLATION";
  }

  if (callType == 2) {
    filtered = removeCorrected(filtered);
    if (filtered == "Correct.") filtered = userMessage;
    filtered = capitalizeFirstLetter(filtered);
    filtered = removePeriod(filtered);
  }

  if (callType == 3) {
    if (filtered == "No.") status = "FAIL";
    filtered = userMessage;
  }

  return { message: filtered, status: status };
}

// Reset the API call count daily
setInterval(() => {
  apiCallCount = 0;
}, oneDayInMillis);

module.exports = route;
