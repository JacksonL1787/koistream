const { reader } = require("../pool")
const tables = require("../tables")

module.exports = async () => {
    let stream = await reader.select("*").from(tables.streams).where("active", true)
    return stream[0];
}