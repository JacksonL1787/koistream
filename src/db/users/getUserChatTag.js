const { reader} = require("../pool")
const tables = require("../tables")

module.exports = async (id) => {
    let chatTag = await reader
        .select({
            name: `${tables.chatTags}.tag_name`,
            color: `${tables.chatTags}.tag_color`
        })
        .from(tables.userChatTags)
        .join(tables.chatTags, `${tables.userChatTags}.chatTagId`, '=', `${tables.chatTags}.id`)
        .where(`${tables.userChatTags}.id`, id)
    chatTag = chatTag[0]
    return chatTag;
}