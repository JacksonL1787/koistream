const { reader, writer } = require("../pool")
const tables = require("../tables")

const getStreamStatus = require("../streamSettings/getStreamStatus")

const randomstring = require("randomstring")
const Filter = require('bad-words'),
    filter = new Filter();

module.exports = async (user, message) => {
    let activeStream = await getStreamStatus();
	if(!activeStream) return false;
    
    let chat = await writer.insert({
        message: message,
        messageFiltered: filter.clean(message),
        chatId: randomstring.generate(),
        userGoogleId: user.googleId
    })
    .into(tables.liveChats)
    .returning("*")

    return chat[0];
}
