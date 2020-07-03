const getStream = require('./getStream') 

module.exports = async (db) => {
    const stream = await getStream(db);
    const participantCount = stream.participants ? stream.participants.length : 0
    return participantCount;
}