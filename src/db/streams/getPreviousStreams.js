const { reader } = require("../pool")
const tables = require("../tables")

module.exports = async () => {
    let streams = await reader.select("*").from(tables.streams).where("active", false)
    return streams;
}