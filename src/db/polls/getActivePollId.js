const { reader } = require("../pool")
const tables = require("../tables")

module.exports = async () => {
    let activePollId = await reader.select("id").from(tables.polls).where("active", true)
    return activePollId.length > 0 ? activePollId[0].id : false;
}