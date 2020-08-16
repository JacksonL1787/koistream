const {  reader } = require("../pool")
const tables = require("../tables")


module.exports = async () => {
    const getErrors = await reader.select("*").from(tables.errors)
    return getErrors;
}
