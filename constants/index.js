module.exports = {
  // list of code of conduct violation responses
  STATEMENT: [
    "can't assist with that",
    "cannot assist with that",
    "cannot help with that",
    "can't help with that",
    "cannot provide assistance",
    "can't provide assistance",
    "don't have the ability",
    "do not have the ability",
    "unable to provide assistance",
    "not able to provide assistance",
  ],
  SYSTEM_MESSAGE_ONE:
    "Correct provided statements to standard English. Shortest responses only.", // validate question grammar
    SYSTEM_MESSAGE_TWO:
    "Correct provided words to standard English. Shortest responses only.", // validate answer grammar
    SYSTEM_MESSAGE_THREE: "Tell me if the reply is relevant. Shortest answer only.", // validate question-answer related
};
