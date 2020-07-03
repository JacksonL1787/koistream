const randomstring = require("randomstring")
const Filter = require('bad-words'),
    filter = new Filter();

module.exports = (db, user, message, adminOnly) => {
    const data = {
        message: message,
        messageFiltered: filter.clean(message),
        chatID: randomstring.generate(),
        userName: user.firstName + " " + user.lastName,
        userGoogleId: user.googleId,
        userChatTag: user.chatTag,
        timestamp: Date.now(),
        flagged: false,
        flagData: {},
        adminOnly: adminOnly
    }
    db.collection("streams").updateOne({"active": true},
        {$push: {liveChats: data}}
    )
    return data;
}