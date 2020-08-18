const { reader } = require("../pool")
const tables = require("../tables")


module.exports = async (isAdmin) => {
    try {

        let activeStreamId = await reader.select("streamId").from(tables.streams).where("active",true)
        if(!activeStreamId[0]) return []
        activeStreamId = activeStreamId[0].streamId
        
        let query = [
            `${tables.liveChats}.messageFiltered as message`,
            `${tables.liveChats}.chatId`, 
            `${tables.liveChats}.timestamp`,
            `${tables.users}.firstName`,
            `${tables.users}.lastName`,
            `${tables.users}.chatTag`
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
