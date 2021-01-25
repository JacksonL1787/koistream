const { reader } = require("../pool")
const tables = require("../tables")

module.exports = async () => {
    let activityLogs = await reader
        .select("*")
        .from(tables.streamActivity)
        .join(tables.users, `${tables.users}.googleId`, '=', `${tables.streamActivity}.user`)
    return activityLogs;
}