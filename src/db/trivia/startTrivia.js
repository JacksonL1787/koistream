const { reader, writer } = require("../pool")
const tables = require("../tables")

const getActiveTrivia = require("./activeTrivia")

module.exports = async () => {
    let activeTrivia = await getActiveTrivia()
    if(activeTrivia) return false;
    const writeQuery = await writer(tables.triviaTemplates).update({active: true})
    return true;
}