const { reader, writer } = require("../pool")
const tables = require("../tables")

module.exports = async (id) => {
	id = parseInt(id)
	let tag = await reader.select("*").from(tables.chatTags).where("id", id)
	if(tag.length === 0) return false;

	let userChatTags = await reader.select("*").from(tables.userChatTags).where("chatTagId", id)
	userChatTags = userChatTags.map(x => x.id)

	const trx = await writer.transaction();

	try {
		await trx(tables.users)
			.update({
				chatTag: trx.raw("NULL")
			})
			.whereIn("chatTag", userChatTags)
	} catch(e) {
		console.log(e)
		trx.rollback(e)
	}

	try {
		await trx(tables.userChatTags)
			.where("chatTagId", id)
			.del()
	} catch(e) {
		console.log(e)
		trx.rollback(e)
	}

	try {
		await trx(tables.chatTags)
			.where("id", id)
			.del()
	} catch(e) {
		console.log(e)
		trx.rollback(e)
	}

	await trx.commit()
	return true;
}