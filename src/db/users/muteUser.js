const { reader, writer } = require("../pool")
const tables = require("../tables")



module.exports = async (user) => {

    let mute = await reader
        .select("muted")
        .from(tables.users)
        .where("googleId", user)
    if(!mute.length) {
        return {success: false, status: false}
    }
    mute = mute[0].muted

    let muteStatus = await writer(tables.users)
        .where("googleId", user)
        .update({
            muted: !mute
        })
    
    return {success: true, status: !mute}
}
