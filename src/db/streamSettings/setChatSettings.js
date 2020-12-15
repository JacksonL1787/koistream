const { reader } = require("../pool")
const tables = require("../tables")

module.exports = async () => {
    let info = await reader
        .select([
            "chatCooldown as cooldown",
            "chatActive as active"
        ])
        .from(tables.streamSettings)
    return info[0];
}