const { reader } = require("../pool")
const tables = require("../tables")

module.exports = async () => {
    let info = await reader
        .select([
            "title",
            "description",
            "active"
        ])
        .from(tables.streams)
        .where("active", true)
    info = info[0]
    return info;
}