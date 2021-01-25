const { reader } = require("../pool")
const tables = require("../tables")

module.exports = async () => {
    let count = await reader
        .select(["chatId"])
        .from(tables.liveChats)
        .where("cleared", false)
        .andWhere("deleted", false)
    
    return count.length;
}