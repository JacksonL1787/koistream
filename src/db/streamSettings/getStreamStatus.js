const { reader } = require("../pool")
const tables = require("../tables")

module.exports = async () => {
    let status = await reader
        .select("*")
        .from(tables.streamSettings)
        .where("streamActive", true)
    status = status.length > 0
    return status;
}