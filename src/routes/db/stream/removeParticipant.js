const getParticipantGoogleId = require('./getParticipantGoogleId')
const addParticipantLog = require("./addParticipantLog")

module.exports = async (db, socketId) => {
    const googleId = await getParticipantGoogleId(db, socketId)
    if(!googleId) {
        return false;
    }
    await db.collection("streams").updateOne({"active": true},{ "$pull": {"participants": {googleId: googleId}} } )
    return true;
}