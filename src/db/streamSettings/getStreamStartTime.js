const { reader } = require("../pool")
const tables = require("../tables")

module.exports = async () => {
    let time = await reader
        .select(["streamStartTime"])
        .from(tables.streamSettings)
    return time[0].streamStartTime;
}