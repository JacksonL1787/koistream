const { writer } = require("../pool")
const tables = require("../tables")

module.exports = async (status) => {
    if(typeof status !== "boolean") return false;
    let slate = await writer(tables.streamSettings).update({chatActive: status})
    return true;
}