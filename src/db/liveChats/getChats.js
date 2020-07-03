const { reader } = require("../pool")
const tables = require("../tables")


module.exports = async (isAdmin) => {
    try {

        let activeStreamId = await reader.select("streamId").from(tables.streams).where("active",true)
        activeStreamId = activeStreamId[0].streamId

        console.log(activeStreamId)

        if(!activeStreamId) return []

        let query = [
            `${tables.liveChats}.messageFiltered as message`,
            `${tables.liveChats}.chatId`, 
            `${tables.liveChats}.timestamp`,
            `${tables.users}.firstName`,
            `${tables.users}.lastName`
        ]

        if(isAdmin) {
            query = [...query, `${tables.users}.muted`, `${tables.liveChats}.message as unfilteredMessage`]

        }

        let chats = await reader.select(query)
        .from(tables.liveChats)
        .join(tables.users, `${tables.liveChats}.userGoogleId`, '=', `${tables.users}.googleId`)
        .where(`${tables.liveChats}.deleted`, false)
        .andWhere(`${tables.liveChats}.streamId`, activeStreamId)
        return chats;
    } catch(e) {
        throw new Error(e)
    }
    
}
