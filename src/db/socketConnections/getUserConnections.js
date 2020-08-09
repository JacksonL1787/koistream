const { reader} = require("../pool")
const tables = require("../tables")

module.exports = async (googleId) => {
    let connections = await reader.select("*").from(tables.socketConnections).where("googleId", googleId)
    return connections;
    
}