const axios = require('axios');
const { checkStatementsInSentence, removeCorrected, removeLastPeriod } = require('../service/AiValidation');
const { STATEMENT, SYSTEM_MESSAGE_ONE, SYSTEM_MESSAGE_TWO, SYSTEM_MESSAGE_THREE } = require('../constants');
const { OPEN_AI_URL, OPEN_AI_KEY } = require('../config/env');

const route = require("express").Router();


let lastApiCallTimestamp = 0;
let apiCallCount = 0;

const maxCallsPerDay = 2200;
const oneDayInMillis = 24 * 60 * 60 * 1000; // 24 hours in milliseconds


route.get('/1', async (req, res) => {
    await handleRequest(req, res, SYSTEM_MESSAGE_ONE, 1);
});

route.get('/2', async (req, res) => {
    await handleRequest(req, res, SYSTEM_MESSAGE_TWO, 2);
});

route.get('/3', async (req, res) => {
    await handleRequest(req, res, SYSTEM_MESSAGE_THREE, 3);
});

async function handleRequest(req, res, systemMessage, callType) {
    try {
        const now = Date.now();
        const timeSinceLastCall = now - lastApiCallTimestamp;

	// get userMessage from URL variable ?userMessage=
        const userMessage = req.query.userMessage;

	if (userMessage=='') {
	    res.status(400).json({ message: 'Empty Message', status: 'ERROR'});
            return;
	}

        if (timeSinceLastCall < 3000) {
            const delay = 3000 - timeSinceLastCall;
            await new Promise(resolve => setTimeout(resolve, delay));
        }

        if (apiCallCount >= maxCallsPerDay) {
            res.status(429).json({ message: 'API Limit', status: 'ERROR' });
            return;
        }

        lastApiCallTimestamp = Date.now();
        apiCallCount++;

        // Make an API call using axios
        const response = await axios.post(OPEN_AI_URL,
  		{
		    model: 'gpt-3.5-turbo',
		    messages: [
		      {
		        role: 'system',
		        content: systemMessage
		      },
		      {
		        role: 'user',
		        content: userMessage
		      }
		    ],
		    temperature: 0,
		    max_tokens: 256,
		    top_p: 1,
		    frequency_penalty: 0,
		    presence_penalty: 0
		  }, {
		    headers: {
		      'Content-Type': 'application/json',
		      'Authorization': `Bearer ${OPEN_AI_KEY}`
		    }
		  }
	);

        // Process the API response
        const modifiedResponse = checkResponse(response.data, userMessage, callType);

        // Send the modified response to the client
        res.json(modifiedResponse);
    } catch (error) {
       // console.error('Error:', error);

	if (error.response) {
            // The request was made and the server responded with a status code
            if (error.response.status === 400) {
                // Handle 400 Bad Request error
                res.status(400).json({ message: 'Bad Request', status: 'ERROR'});
            } else {
                res.status(error.response.status).json({ message: error.response.data, status:'ERROR' });
            }
        } else if (error.request) {
            // The request was made but no response was received
            res.status(500).json({ message: 'No GPT Response', status:'ERROR' });
        } else {
            // Something happened in setting up the request that triggered an Error
            res.status(500).json({ message: 'GPT Request Error', status: 'ERROR' });
        }

    }
}


// Function to check the response
function checkResponse(responseData, userMessage, callType) {

    let filtered = responseData.choices[0].message.content;
    let status = 'OK';

    const found = checkStatementsInSentence(STATEMENT, filtered);

    if (found) {
      filtered=userMessage;
      status = 'VIOLATION';
    }

    if (callType==2) {
	filtered = removeCorrected(filtered);
	if (filtered=='Correct.') filtered=userMessage;
	filtered = filtered.charAt(0).toUpperCase() + filtered.slice(1);
	filtered = removeLastPeriod(filtered);
    }

    if (callType==3) {
	if (filtered=='No.') status='FAIL';
	filtered=userMessage;
    }

    return ({message:filtered,status:status});
}






// Reset the API call count daily
setInterval(() => {
    apiCallCount = 0;
}, oneDayInMillis);



module.exports = route;
