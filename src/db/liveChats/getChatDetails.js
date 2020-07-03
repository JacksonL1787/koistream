const { reader } = require("../pool")
const tables = require("../tables")


module.exports = async (chatId) => {
    try {
        let details = await reader.select([
            `${tables.liveChats}.message`, 
            `${tables.liveChats}.messageFiltered`, 
            `${tables.liveChats}.timestamp`,
            `${tables.liveChats}.chatId`,
            `${tables.users}.firstName`,
            `${tables.users}.lastName`,
            `${tables.users}.email`,
            `${tables.users}.googleProfilePicture`,
            `${tables.users}.grade`,
            `${tables.users}.banned`,
            `${tables.users}.muted`,
            `${tables.users}.googleId`
        ])
        .from(tables.liveChats)
        .where(`${tables.liveChats}.chatId`, chatId)
        .join(tables.users, `${tables.liveChats}.userGoogleId`, '=', `${tables.users}.googleId`)
        return details;
    } catch(e) {
        throw new Error(e)
    }
    
}
