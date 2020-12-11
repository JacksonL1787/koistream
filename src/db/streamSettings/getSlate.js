const { reader } = require("../pool")
const tables = require("../tables")

module.exports = async () => {
    let slate = await reader
        .select([
            "slate",
        ])
        .from(tables.streamSettings)
    return slate[0];
}