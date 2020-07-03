const getStream = require("./getStream")

module.exports = async (db) => {
    const stream = await getStream(db)
    if(!stream.participantLogs || stream.participantLogs.length <= 0) {
        return [];
    }
    return stream.participantLogs
}