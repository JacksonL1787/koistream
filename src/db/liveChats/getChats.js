const { reader } = require("../pool")
const tables = require("../tables")
const getStreamStatus = require("../streamSettings/getStreamStatus")


module.exports = async (auth) => {
	try {
		let isAdmin = auth === 3
		console.log(isAdmin)
		let activeStream = await getStreamStatus();
		if(!activeStream) return [];
		
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
			query = [...query, `${tables.users}.googleId`, `${tables.users}.muted`, `${tables.liveChats}.message as unfilteredMessage`]

		}

		let chats = await reader.select(query)
			.from(tables.liveChats)
			.join(tables.users, `${tables.liveChats}.userGoogleId`, '=', `${tables.users}.googleId`)
			.fullOuterJoin(tables.userChatTags, `${tables.userChatTags}.id`, '=', `${tables.users}.chatTag`)
			.fullOuterJoin(tables.chatTags, `${tables.chatTags}.id`, '=', `${tables.userChatTags}.chatTagId`)
			.fullOuterJoin(tables.nameColors, `${tables.nameColors}.id`, '=', `${tables.users}.nameColor`)
			.where(`${tables.liveChats}.deleted`, false)
			.andWhere(`${tables.liveChats}.cleared`, false)
		
			if(isAdmin) {
			chats = chats.map(x => {
				return {...x, "moderator": true}
			})
		}
		return chats;
	} catch(e) {
		throw new Error(e)
	}
}
