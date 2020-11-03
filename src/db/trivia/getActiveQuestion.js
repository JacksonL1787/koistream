const { reader, writer } = require("../pool")
const tables = require("../tables")

function randomize(array) {
	var currentIndex = array.length, temporaryValue, randomIndex;
	while (0 !== currentIndex) {
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}
	return array;
}

let getActiveTrivia = require("./activeTrivia")

module.exports = async (user) => {
	let activeTrivia = await getActiveTrivia()
	if(!activeTrivia) return {type: "getScore"}
    let question = await reader.select(["question", "id", "stage", "number"]).from(tables.triviaQuestions).where("active", true)
	question = question.length ? question[0] : false
	if(!question) return {type: "title"}
	let userResponded = await reader.select("*").from(tables.triviaAnswers).where("user", user).andWhere("question_id", question.id)
	userResponded = userResponded.length ? true: false;
    if(userResponded && question.stage != 2) return {type: "waiting"}
    let optionsQuery = question.stage === 2 ? ["value", "correct", "id"] : ["value", "id"]
    let options = await reader.select(optionsQuery).from(tables.triviaOptions).where("question_id", question.id)
	randomize(options)
	let data = {
		id: question.id,
		value: question.question,
		stage: question.stage,
		number: question.number,
        options: options
	}
    return {type: "question", data};
}