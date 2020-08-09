const { writer } = require("../pool")
const tables = require("../tables")

module.exports = async (data) => {

    const trx = await writer.transaction();
    try {
        await trx(tables.streams)
        .update({active: false, endTime: trx.fn.now()})
        .where("active", true)
    } catch(e) {
        trx.rollback(e)
    }

    try {
        await trx(tables.slate)
        .update({active: true, type: 1})
    } catch(e) {
        trx.rollback(e)
    }

    await trx.commit()
    return;
}