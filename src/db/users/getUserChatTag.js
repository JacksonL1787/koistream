const { reader} = require("../pool")
const tables = require("../tables")

module.exports = async (id) => {
    let chatTag = await reader
        .select({
            name: `${tables.chatTags}.tag_name`,
            color: `${tables.chatTags}.tag_color`
        })
        .from(tables.chatTags)
        .where("id", id)
    chatTag = chatTag[0]
    return chatTag;
}