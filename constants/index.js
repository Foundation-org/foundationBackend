module.exports = {
  // list of code of conduct violation responses
  STATEMENT: [
    "able to assist",
    "assist with that",
    "provide assistance",
    "have the ability",
    "help with that",
    "unable to assist",
    "i'm sorry, ",
    "sorry, ",
    "please provide",
    "did you mean",
    "I cannot understand this message"
  ],
  SYSTEM_MESSAGES: [
    // Q/S
    "Correct provided statement to standard English without contractions. Shortest responses only.",
    // OPTION
    "Correct text to standard English without contractions. Never correct brand names or informal words like Coke. Shortest responses only",
    // PREFERENCES
    "Suggest a topic category for this statement. One word answer only.",
    // COC
    "You are a content moderator for a large social network. I will give you posts to rate. Respond with a rejection score from 0-100 only. Number only.",
    // FIRST NAME
    "Is this a valid first name for a person? Answer yes or no or no only.",
    // LAST NAME
    "Is this a valid last name for a person? Answer yes or no or no only."
  ],
  // ACCOUNT_SIGNUP_AMOUNT: 4,
  ACCOUNT_BADGE_ADDED_AMOUNT: 0.96,
  QUEST_COMPLETED_AMOUNT: 0.96,
  QUEST_OWNER_ACCOUNT: 0.10,
  QUEST_COMPLETED_CHANGE_AMOUNT: 0.00,
  QUEST_CREATED_AMOUNT: 0.1,
  QUEST_OPTION_ADDED_AMOUNT: 0.10,
  QUEST_OPTION_CONTENTION_GIVEN_AMOUNT: 0.10,
  QUEST_OPTION_CONTENTION_REMOVED_AMOUNT: 0.10,
};
