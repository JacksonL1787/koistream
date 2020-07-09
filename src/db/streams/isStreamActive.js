const { reader } = require("../pool")
const tables = require("../tables")

module.exports = async () => {
    let activeStream = await reader.select("active").from(tables.streams).where("active", true)
    return activeStream.length > 0;
}