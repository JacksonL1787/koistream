const { writer } = require("../pool")
const tables = require("../tables")

module.exports = async (status) => {
    if(typeof status !== "boolean") return false;
    let stream = await writer(tables.streamSettings)
        .update({streamActive: status, streamStartTime: status ? writer.fn.now() : writer.raw("NULL")})
        .select("*")
    return true
}