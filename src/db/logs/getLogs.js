const {  reader } = require("../pool")
const tables = require("../tables")


module.exports = async () => {
    const logs = await reader.select("*").from(tables.logs)
    return logs;
}
