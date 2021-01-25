const { writer } = require("../pool")
const tables = require("../tables")

module.exports = async () => {
    let cleared = await writer(tables.streamActivity)
        .del()
    return true;
}