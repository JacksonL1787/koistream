const { reader, writer } = require("../pool")
const tables = require("../tables")

module.exports = async () => {
    let trivia = await reader.select("*").from(tables.triviaTemplates).where("active", true)
    trivia = trivia.length ? trivia[0] : false
    return trivia;
}