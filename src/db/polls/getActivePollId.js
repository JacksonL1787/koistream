const { reader } = require("../pool")
const tables = require("../tables")

module.exports = async () => {
    let activePollId = await reader.select("id").from(tables.polls).where("active", true)
    return activePollId[0].id;
}