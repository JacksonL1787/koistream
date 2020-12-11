const { reader } = require("../pool")
const tables = require("../tables")


module.exports = async () => {
    let settings = await reader.select(["chatCooldown as cooldown","chatActive as active"]).from(tables.streamSettings)
    settings = settings[0]
    return settings;
}
