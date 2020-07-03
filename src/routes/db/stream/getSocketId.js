const getStream = require('./getStream')

module.exports = async (db, googleId) => {
    const stream = await getStream(db);
    const participants = stream.participants;
    let socketId = false
    if(participants) {
        participants.forEach((p) => {
            if(p.googleId === googleId) {
                socketId = p.socketId
            }
        })
    }
    return socketId
}