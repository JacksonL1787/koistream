const { reader, writer } = require("../pool")
const tables = require("../tables")

module.exports = async (user) => {
    let answers = await reader.select("correct").from(tables.triviaAnswers).where("user", user)
    answers = answers.map(x => x.correct)
    let correctCount = 0
    answers.forEach((c) => {
        if(c) correctCount++;
    })
    return correctCount;
}