const { STATEMENT } = require("../constants");

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

module.exports.removePeriod = (paragraph) => {
  const sentences = paragraph.split(". ");

  if (sentences.length === 1 && paragraph.endsWith(".")) {
    return this.removeTrailingPeriods(paragraph);
  }

  return paragraph;
};

module.exports.removeTrailingPeriods = (sentence) => {
  const regex = /\.*$/;
  return sentence.replace(regex, "");
};

module.exports.removeCorrected = (inputString) => {
  const regex = /Corrected: /gi;
  return inputString.replace(regex, "");
};
