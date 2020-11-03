const { reader, writer } = require("../pool")
const tables = require("../tables")

const getActiveTrivia = require("./activeTrivia")

module.exports = async () => {
    let activeTrivia = await getActiveTrivia()
    if(!activeTrivia) return false;
    let question = await reader.select("*").from(tables.triviaQuestions).where("active", true)
    question = question.length ? question[0] : false
    if(!question) {
		let writeQuery = await writer(tables.triviaQuestions).update({active: true, stage: 1}).where("trivia_id", activeTrivia.id).andWhere("number", 1)
		return "showQuestion"
    } else if (question.stage === 1) {
		let writeQuery = await writer(tables.triviaQuestions).update({stage: 2}).where("active", true)
        return "showAnswer"
    } else if (question.stage === 2) {
        let isNextQuestion = await reader.select("id").from(tables.triviaQuestions).where("trivia_id", activeTrivia.id).andWhere("number", parseInt(question.number)+1)
        if(!isNextQuestion.length) {
            return "end"
        }
        const trx = await writer.transaction();
        try {
            await trx(tables.triviaQuestions).update({active: false, stage: trx.raw("NULL")}).where("active", true)
        } catch(e) {
            trx.rollback(e)
        }
        try {
            await trx(tables.triviaQuestions).update({active: true, stage: 1}).where("trivia_id", activeTrivia.id).andWhere("number", parseInt(question.number)+1)
        } catch(e) {
            trx.rollback(e)
        }

		await trx.commit()
        return "showQuestion"
    }
    return;
}