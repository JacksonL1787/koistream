const { reader } = require("../pool")
const tables = require("../tables")

module.exports = async () => {
    let info = await reader
        .select([
            "title",
            "description"
        ])
        .from(tables.streamSettings)
    return info[0];
}