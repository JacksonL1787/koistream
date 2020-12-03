const { reader, writer } = require("../pool")
const tables = require("../tables")
const getActivePollId = require("./getActivePollId")

module.exports = async () => {
    const activePollId = await getActivePollId()
    if(!activePollId) return false;
    const poll = await writer(tables.pollTemplates)
        .update({
            active: false
        })
        .where("active", true)
    
    const options = await reader
        .select(["value", "voteCount"])
        .from(tables.pollOptions)
    
    return options;
}