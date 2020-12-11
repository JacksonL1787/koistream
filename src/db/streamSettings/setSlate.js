const { writer } = require("../pool")
const tables = require("../tables")

module.exports = async (type) => {
    if(type != "off" && isNaN(type)) return false;
    let slate = await writer(tables.streamSettings).update({slate: type === "off" ? false : true})
    return true;
}