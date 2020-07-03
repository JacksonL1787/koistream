const { writer } = require("../pool")
const tables = require("../tables")

module.exports = async (chatId) => {
    return await writer(tables.liveChats)
        .where("chatId", chatId)
        .update({
            deleted: true
        })
}
