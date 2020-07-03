const getStream = require('./getStream');

module.exports = async (db, socketId) => {
    const stream = await getStream(db)
    if(!stream.participants || stream.participants.length <= 0 ) {
        return false
    }
    let googleId = stream.participants.filter(x => x.socketId===socketId)
    if(googleId.length <= 0) {
        return false;
    }
    googleId = googleId[0].googleId
    return googleId;
}