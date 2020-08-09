const { writer, reader } = require("../pool")
const tables = require("../tables")

module.exports = async (type) => {
    if(type != "off" && isNaN(type)) return false;
    console.log(type)
    if(type != "off") {
        let isSlateType = await reader.select("*").from(tables.slateTypes).where("type", type)
        if(isSlateType.length === 0) return false;
    }
    await writer(tables.slate).update(type === "off" ? {active: false} : {active: true, type: type})
    return true;
}