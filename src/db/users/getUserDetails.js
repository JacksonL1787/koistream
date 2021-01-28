const { reader} = require("../pool")
const tables = require("../tables")
const _ = require("lodash")
//const iplocate = require("")

module.exports = async (googleId) => {
	console.log(googleId)
	let user = await reader
		.select([
			`${tables.users}.email`,
			`${tables.users}.firstName`,
			`${tables.users}.lastName`,
			`${tables.users}.googleProfilePicture`,
			`${tables.users}.auth`,
			`${tables.users}.muted`,
			`${tables.users}.dateCreated`,
			`${tables.users}.online`,
			`${tables.users}.lastOnline`,
			`${tables.nameColors}.color as nameColor`,
			`${tables.chatTags}.tag_name as tagName`,
			`${tables.chatTags}.tag_color as tagColor`
		])
		.from(tables.users)
		.join(tables.nameColors, `${tables.nameColors}.id`, "=", `${tables.users}.nameColor`)
		.fullOuterJoin(tables.userChatTags, `${tables.userChatTags}.id`, "=", `${tables.users}.chatTag`)
		.fullOuterJoin(tables.chatTags, `${tables.chatTags}.id`, "=", `${tables.userChatTags}.chatTagId`)
		.where("googleId", googleId)
	if(user.length === 0) return false;
	user = user[0]
	return user;
}