const { reader, writer } = require("../pool")
const tables = require("../tables")



module.exports = async (googleId, tempMuted) => {

    let mute = await reader.select("muted").from(tables.users).where("googleId", googleId)
    mute = mute[0].muted

    console.log(mute)

    let isMuted = await writer(tables.users)
        .where("googleId", googleId)
        .update({
            muted: !mute,
            tempMuted: tempMuted
        })
        .returning("muted");
    
    let userChats = await reader
        .select([
            "chatId"
        ])
        .from(tables.liveChats)
        .where("userGoogleId", googleId)
        .andWhere("deleted", false)

    if(userChats.length > 0) {
        userChats = userChats.map(x => x.chatId)
    }
    
    return {chats: userChats, muted: !mute, googleId: googleId}
}
