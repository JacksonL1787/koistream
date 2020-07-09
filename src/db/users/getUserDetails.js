const { reader} = require("../pool")
const tables = require("../tables")
const _ = require("lodash")
//const iplocate = require("")

module.exports = async (googleId) => {
    let user = await reader
        .select("*")
        .from(tables.users)
        .where("googleId", googleId)
    user = user[0]
    let socketConnections = await reader
        .select("socketId", "page")
        .from(tables.socketConnections)
        .where("googleId", googleId)
    user.socketConnections = socketConnections
    let ips = await reader
        .select("ip")
        .from(tables.ips)
        .where("googleId", googleId)
    ips = ips.map(x => x.ip)
    user.ips = ips;
    return user;
}