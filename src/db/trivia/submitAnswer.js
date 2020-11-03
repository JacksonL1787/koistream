const { reader, writer } = require("../pool")
const tables = require("../tables")

const getActiveTrivia = require("./activeTrivia")
const getActiveQuestion = require("./getActiveQuestion")

module.exports = async (user, option_id) => {
    let activeTrivia = await getActiveTrivia()
    if(!activeTrivia) return false;
	let activeQuestion = await reader.select(["question", "id", "stage", "number"]).from(tables.triviaQuestions).where("active", true)
    if(!activeQuestion.length) return false;
    activeQuestion = activeQuestion[0]
	if(activeQuestion.stage != 1) return false;
	let userResponded = await reader.select("*").from(tables.triviaAnswers).where("user", user).andWhere("question_id", activeQuestion.id)
	userResponded = userResponded.length ? true: false;
    if(userResponded) return false;
    let optionExists = false;
    let options = await reader.select(["value", "correct", "id"]).from(tables.triviaOptions).where("question_id", activeQuestion.id)
    activeQuestion.options = options
    activeQuestion.options.forEach((o) => {
        if(o.id === option_id) optionExists = true;
	})
    if(!optionExists) return false;
    let userCorrect = await reader.select("correct").from(tables.triviaOptions).where("id", option_id)
	userCorrect = userCorrect[0].correct
    const writeQuery = await writer(tables.triviaAnswers).insert({
        trivia_id: activeTrivia.id,
        question_id: activeQuestion.id,
        user,
        option_id,
        correct: userCorrect
    })
    return true;
}