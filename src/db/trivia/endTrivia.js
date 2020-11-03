const { reader, writer } = require("../pool")
const tables = require("../tables")

const getActiveTrivia = require("./activeTrivia")

module.exports = async () => {
    let activeTrivia = await getActiveTrivia()
    if(!activeTrivia) return false;
    const trx = await writer.transaction();
    try {
        await trx(tables.triviaTemplates).update({active: false})
    } catch(e) {
        trx.rollback(e)
    }
    try {
        await trx(tables.triviaQuestions).update({active: false, stage: trx.raw("NULL")})
    } catch(e) {
        trx.rollback(e)
    }

    await trx.commit()
    return true;
}