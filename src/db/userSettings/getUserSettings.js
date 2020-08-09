const { reader } = require("../pool")
const tables = require("../tables")

module.exports = async () => {
    let settings = await reader.select("*").from(tables.userSettings)
    settings = settings[0]
    return settings;
}