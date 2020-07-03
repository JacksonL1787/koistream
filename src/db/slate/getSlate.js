const { reader } = require("../pool")
const tables = require("../tables")

module.exports = async () => {
    let slate = await reader.select("*").from(tables.slate)
    return slate[0];
}