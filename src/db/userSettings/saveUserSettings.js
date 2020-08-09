const { writer } = require("../pool")
const tables = require("../tables")

module.exports = async () => {
    let settings = await writer.select("*").from(tables.userSettings)
    return;
}