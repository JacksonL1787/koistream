const { reader, writer } = require("../pool")
const tables = require("../tables")

const randomstring = require("randomstring")
const Filter = require('bad-words'),
    filter = new Filter();

module.exports = async (user, message) => {
    let streamId = await reader.select("streamId").from(tables.streams).where("active", true)
    if(!streamId[0]) return 500;
    streamId = streamId[0].streamId
    
    let chat = await writer.insert({
        message: message,
        messageFiltered: filter.clean(message),
        chatId: randomstring.generate(),
        streamId: streamId,
        userGoogleId: user.googleId
    })
    .into(tables.liveChats)
    .returning("*")

    return chat[0];
}
