const getUserName = require("../../db/users/getUserName")

module.exports = async (io, message) => {
    let shouldRetrun = false;
    let googleIds = message.match(/{([^}]+)}/gmi)
    await Promise.all(googleIds.map(async (id) => {
        id = id.substring(1,id.length - 1)
        const name = await getUserName(id)
        if(!name) shouldReturn = true;
        message = message.replace(`{${id}}`, name)
    }))
    if(shouldRetrun) return;
    io.in('admin').emit("adminNotification", message)
}