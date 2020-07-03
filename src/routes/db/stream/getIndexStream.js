const getStream = require('./getStream') 
const getParticipantCount = require('./getParticipantCount')

module.exports = async (db, user) => {
    const stream = await getStream(db);
    let streamObj = {}
    let chats = []
    if(stream.liveChats && stream.liveChats.length > 0) {
        stream.liveChats.forEach((x) => {
            if(! x.adminOnly || x.userGoogleId === user.googleId) {
                chats.push({message: x.messageFiltered, userName: x.userName, userChatTag: x.userChatTag, timestamp: x.timestamp, chatID: x.chatID})
            }
        })
    }
    streamObj.liveChats = chats
    streamObj.participantCount = stream.participants ? stream.participants.length : 0
    streamObj.chatSettings = stream.chatSettings
    streamObj.name = stream.name
    streamObj.runner = stream.runner
    return streamObj
}