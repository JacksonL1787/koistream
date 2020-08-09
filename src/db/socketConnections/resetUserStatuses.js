const { reader, writer } = require('../pool')
const tables = require('../tables')

module.exports = async () => {

    const trx = await writer.transaction();

    try {
        await trx(tables.socketConnections)
            .del()
    } catch(e) {
        trx.rollback(e)
    }
    
    try {
        await trx(tables.users)
            .update({
                online: false
            });
    } catch(e) {
        trx.rollback(e)
    }
    
    await trx.commit()
    return 
}
