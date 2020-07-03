const { reader } = require("../pool")
const tables = require("../tables")


module.exports = async () => {
    let settings = await reader.select("*").from(tables.chatSettings)
    let formattedSettings = {};
    settings.forEach((i) => {
        formattedSettings[i.setting] = i.value
    })
    return formattedSettings;
}
