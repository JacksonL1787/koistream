const { reader } = require("../pool")
const tables = require("../tables")

module.exports = async () => {
    let activePoll = await reader.select("active").from(tables.polls).where("active", true)
    return activePoll.length > 0;
}