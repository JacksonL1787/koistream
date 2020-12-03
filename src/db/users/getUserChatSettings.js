const { reader} = require("../pool")
const tables = require("../tables")

module.exports = async (googleId, activeChatTag, activeNameColor) => {
    let nameColors = await reader
        .select("*")
        .from(tables.nameColors)
    
    let userChatTags = await reader
        .select([
            `${tables.userChatTags}.id as id`,
            `${tables.chatTags}.tag_color as tagColor`,
            `${tables.chatTags}.tag_name as tagName`
        ])
        .from(tables.userChatTags)
        .join(tables.chatTags, `${tables.chatTags}.id`, '=', `${tables.userChatTags}.chatTagId`)
        .where(`${tables.userChatTags}.user`, googleId)

    nameColors.forEach((c) => {
        c.active = c.id === parseInt(activeNameColor) ? true : false;
    })

    userChatTags.forEach((ct) => {
        ct.active = ct.id == activeChatTag ? true : false;
    })

    const data = {
        nameColors,
        chatTags: userChatTags
    }

    return data;
}