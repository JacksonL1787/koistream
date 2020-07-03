const { writer } = require("../pool")
const tables = require("../tables")



module.exports = async (googleId) => {
    return await writer(tables.users)
        .where(`${tables.users}.googleId`, googleId)
        .update({
            lastChatTime: writer.fn.now()
        });
}
