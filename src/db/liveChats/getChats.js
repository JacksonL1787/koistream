const { reader } = require("../pool")
const tables = require("../tables")


module.exports = async (isAdmin) => {
    try {

        let activeStream = await reader.select("id").from(tables.streams).where("active",true)
        if(!activeStream[0]) return [];
        let activeStreamId = activeStream[0].id
        
        let query = [
            `${tables.liveChats}.messageFiltered as message`,
            `${tables.liveChats}.chatId`, 
            `${tables.liveChats}.timestamp`,
            `${tables.users}.firstName`,
            `${tables.users}.lastName`,
            `${tables.chatTags}.tag_name as tagName`,
			`${tables.chatTags}.tag_color as tagColor`,
			`${tables.nameColors}.color as nameColor`
        ]

        if(isAdmin) {
            query = [...query, `${tables.users}.muted`, `${tables.liveChats}.message as unfilteredMessage`]

        }

        let chats = await reader.select(query)
			.from(tables.liveChats)
			.join(tables.users, `${tables.liveChats}.userGoogleId`, '=', `${tables.users}.googleId`)
			.fullOuterJoin(tables.userChatTags, `${tables.userChatTags}.id`, '=', `${tables.users}.chatTag`)
			.fullOuterJoin(tables.chatTags, `${tables.chatTags}.id`, '=', `${tables.userChatTags}.chatTagId`)
			.fullOuterJoin(tables.nameColors, `${tables.nameColors}.id`, '=', `${tables.users}.nameColor`)
			.where(`${tables.liveChats}.deleted`, false)
			.andWhere(`${tables.liveChats}.streamId`, activeStreamId)
        return chats;
    } catch(e) {
        throw new Error(e)
    }
}
