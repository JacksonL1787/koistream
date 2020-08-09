const { reader, writer } = require('../pool')
const tables = require('../tables')

module.exports = async (googleId, socketId) => {

    const trx = await writer.transaction();

    console.log(socketId)

    let onlineClients = await reader.select("*").from(tables.socketConnections).where("googleId", googleId)
    console.log(onlineClients.length)
    try {
        await trx(tables.socketConnections)
            .where("socketId", socketId)
            .del()
    } catch(e) {
        trx.rollback(e)
    }
    
    if(onlineClients.length - 1 === 0) {
        try {
            await trx(tables.users)
                .where("googleId", googleId)
                .update({
                    online: false,
                    lastOnline: writer.fn.now()
                });
        } catch(e) {
            trx.rollback(e)
        }
    }
    await trx.commit()
    return 
}
