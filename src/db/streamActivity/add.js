const { writer, reader } = require("../pool")
const tables = require("../tables")
const getStreamStatus = require("../streamSettings/getStreamStatus")

module.exports = async (user, msg, io, emit) => {
    let streamActive = await getStreamStatus()
    if(!streamActive) return;

    let userObj = await reader.select("*").from(tables.users).where("googleId", user)
    if(!userObj.length) return;
    userObj = userObj[0]

    let activity = await writer(tables.streamActivity)
        .insert({
            message: msg,
            user: user
        })
        .returning("*")
    activity = {...userObj, ...activity[0]}
    if(emit) io.in("admin").emit("newStreamActivity", activity)
    return true;
}