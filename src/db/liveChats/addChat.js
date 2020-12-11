const { reader, writer } = require("../pool")
const tables = require("../tables")

const randomstring = require("randomstring")
const Filter = require('bad-words'),
    filter = new Filter();

module.exports = async (user, message) => {
    let activeStream = await reader.select("id").from(tables.streams).where("active", true)
    if(!activeStream[0]) return 500;
    let activeStreamId = activeStream[0].id
    
    let chat = await writer.insert({
        message: message,
        messageFiltered: filter.clean(message),
        chatId: randomstring.generate(),
        streamId: activeStreamId,
        userGoogleId: user.googleId
    })
    .into(tables.liveChats)
    .returning("*")

    return chat[0];
}
