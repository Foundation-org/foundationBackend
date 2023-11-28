const emailValidator = require('email-validator');

const stripDelay = 1000;
const minApiCallDelay = 3000;
const maxApiCallsPerDay = 2200;
const oneDayInMillis = 24 * 60 * 60 * 1000;

let lastApiCallTimestamp = 0;
let apiCallCount = 0;

setInterval(() => {
    apiCallCount = 0;
}, oneDayInMillis);

const apiUrl = 'http://universities.hipolabs.com/search?domain=';

module.exports.eduEmailCheck = async (req, res, eMail) => {
    try {
        const now = Date.now();
        const timeSinceLastCall = now - lastApiCallTimestamp;
        // const eMail = req.query.eMail;

        if (timeSinceLastCall < minApiCallDelay) {
        const delay = minApiCallDelay - timeSinceLastCall;
        await new Promise(resolve => setTimeout(resolve, delay));
        }

        if (apiCallCount >= maxApiCallsPerDay) {
        // res.status(429).json({ message: 'API Limit', status: 'ERROR' });
        return { message: 'API Limit', status: 'WAIT' };
        }

        if (validateEmail(eMail)) {
            const domain=extractDomain(eMail)

            lastApiCallTimestamp = Date.now();
            apiCallCount++;

            while (true) {
                let url=apiUrl+domain
                let response = await axios.get(url);
                let data=response.data
            
                if (data.length < 1) {
                domain=stripDomain(domain);
                    if (countPeriods(domain) == 0 ) {
                    // res.json({ message: 'Not a valid EDU', status: 'FAIL' });
                    return { message: 'Not a valid EDU', status: 'FAIL' };
                    }
                } else {
                    // res.json({ message: response.data, status: 'OK' });
                    return { message: response.data, status: 'OK' };
                }
                await new Promise(resolve => setTimeout(resolve, stripDelay));
            }

        } else {
            // return res.json({ message: 'Not a valid e-mail', status: 'ERROR' });
            return { message: 'Not a valid e-mail', status: 'ERROR' };
        }

      } catch (error) {
        console.error(error);
        // res.status(500).json({ message: `An error occurred in eduEmail: ${error.message}` });
        return { message: error.message, status: 'UNEXPECTED' };
      }
};


function validateEmail(email) {
    return emailValidator.validate(email);
}

function extractDomain(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.split('@')[1];
}

function stripDomain(domain) {
  return domain.replace(/^([^.]+)\./, '');
}

function countPeriods(inputString) {
    const periods = inputString.match(/\./g);
    return periods ? periods.length : 0;
}

