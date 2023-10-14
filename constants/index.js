module.exports = {
  // list of code of conduct violation responses
  STATEMENT: [
    "able to assist",
    "assist with that",
    "provide assistance",
    "have the ability",
    "help with that",
    "unable to assist"
    // "can't assist with that",
    // "cannot assist with that",
    // "cannot help with that",
    // "can't help with that",
    // "cannot provide assistance",
    // "can't provide assistance",
    // "don't have the ability",
    // "do not have the ability",
    // "unable to provide assistance",
    // "not able to provide assistance",
    // "unable to assist",
    // "not able to assist",
    // "check grammar answer",
    // "can't assist with that",
    // "cannot assist with that",
    // "cannot help with that",
    // "can't help with that",
    // "cannot provide assistance",
    // "can't provide assistance",
    // "don't have the ability",
    // "do not have the ability",
    // "unable to provide assistance",
    // "not able to provide assistance",
  ],
  SYSTEM_MESSAGES: [
    "Correct provided statement to standard English. Shortest responses only.",
    "Correct provided text to standard English. Shortest responses only.",
    // "Tell me if the reply is relevant. Shortest answer only.",
    'I will give you a statement and a reply. Tell me if the reply can be relevant. Shortest answer only.', // new
    'Reject the statement if it is a fragment or non-sensical. Shortest answer only.' // new
  ],
};
