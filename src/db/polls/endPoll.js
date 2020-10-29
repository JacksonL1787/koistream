const { reader, writer } = require("../pool")
const tables = require("../tables")
const isPollActive = require("./isPollActive")

module.exports = async (data) => {
    const activePoll = await isPollActive()
    if(!activePoll) return false;
    const poll = await writer(tables.polls)
        .update({
            active: false,
            time_end: writer.fn.now()
        })
        .where("active", true)
    return true;
}