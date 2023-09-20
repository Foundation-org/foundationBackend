
module.exports.checkStatementsInSentence = (statements, sentence) => {
    const lowerCaseSentence = sentence.toLowerCase();
    return statements.some(statement => lowerCaseSentence.includes(statement.toLowerCase()));
}


module.exports.removeCorrected = (inputString) => {
    const regex = /Corrected: /gi;
    return inputString.replace(regex, '');
}


module.exports.removeLastPeriod = (paragraph) => {
    const sentences = paragraph.split('. ');

    if (sentences.length === 1 && paragraph.endsWith('.')) {
        return paragraph.slice(0, -1);
    }

    return paragraph;
}
