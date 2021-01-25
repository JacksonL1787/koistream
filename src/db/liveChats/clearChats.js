const { writer } = require("../pool")
const tables = require("../tables")

module.exports = async () => {
    return await writer(tables.liveChats)
        .update({
            cleared: true
        })
}
