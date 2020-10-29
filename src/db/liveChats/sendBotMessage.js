const stripHtml = require("string-strip-html")
const addChat = require("./addChat")

module.exports = async (io, message) => {
    message = stripHtml(message).result
    const user = {
        googleId: "106832831589496473449"
    }
    const chatData = await addChat(user, message)

    io.in('admin').emit("newChatAdmin", {
        message: message,
        unfilteredMessage: message,
        userName: "KoiStream",
        chatId: chatData.chatId,
        muted: false,
        tagName: "BOT",
        tagColor : "#2e86de"

    })
    io.emit("newChat", {
        message: message,
        userName: "KoiStream",
        chatId: chatData.chatId,
        tagName: "BOT",
        tagColor : "#2e86de"
    })

    return true;
}