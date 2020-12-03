const { reader, writer } = require("../pool")
const tables = require("../tables")

module.exports = async (googleId, data) => {
    console.log(data)
    let nameColorExists = await reader.select("*").from(tables.nameColors).where("id", data.nameColor)
    if(nameColorExists.length == 0) return false;

    if(data.chatTag != "false") {
        let userOwnsChatTag = await reader.select("*").from(tables.userChatTags).where("user", googleId).andWhere("id", data.chatTag)
        
        if(userOwnsChatTag.length == 0) return false;
    }

    const trx = await writer.transaction();

    try {
        await trx(tables.users)
            .update({
                nameColor: parseInt(data.nameColor)
            })
            .where("googleId", googleId)
    } catch(e) {
        console.log(e)
        trx.rollback(e)
    }

    try {
        await trx(tables.users)
            .update({
                chatTag: data.chatTag == "false" ? null : data.chatTag
            })
            .where("googleId", googleId)
    } catch(e) {
        console.log(e)
        trx.rollback(e)
    }

    await trx.commit()
    return true;
}