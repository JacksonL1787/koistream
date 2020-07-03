const getUserByGoogleId = require('./getUserByGoogleId')

module.exports = async (db, googleId) => {
    const user = await getUserByGoogleId(db, googleId)
    return user.lastChatTime
}