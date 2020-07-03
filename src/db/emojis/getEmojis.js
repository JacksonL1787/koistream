const { reader } = require("../pool")
const tables = require("../tables")


module.exports = async () => {
    const emojis = await reader.select(["tag", "src"]).from(tables.emojis)
    return  emojis;
}
