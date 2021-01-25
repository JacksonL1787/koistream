const {  reader } = require("../pool")
const tables = require("../tables")

module.exports = async () => {
    const tags = await reader
        .select("*")
        .from(tables.chatTags)
    return tags;

}