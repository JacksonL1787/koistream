const getUserConnections = require("../../db/socketConnections/getUserConnections")

module.exports = async (io, googleId, emitId, data) => {
    let connections = await getUserConnections(googleId)
    connections.forEach((c) => {
        io.to(c.socketId).emit(emitId, data);
    })
    return;
}