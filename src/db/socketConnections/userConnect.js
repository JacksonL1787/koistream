const { reader, writer } = require('../pool')
const tables = require('../tables')

module.exports = async (googleId, page, socketId) => {
    let urls = [
        "https://dev.community.designtechhs.com",
        "http://dev.community.designtechhs.com",
        "https://community.designtechhs.com",
        "http://community.designtechhs.com"
    ]
    urls.forEach((u) => {
        page = page.replace(u, "")
    })

    const trx = await writer.transaction();

    try {
        await trx(tables.users)
            .where("googleId", googleId)
            .update({
                online: true,
                lastOnline: null
            });
    } catch(e) {
        trx.rollback(e);
    }

    try {
        await trx(tables.socketConnections)
            .where("googleId", googleId)
            .insert({
                googleId: googleId,
                page: page,
                socketId: socketId
            });
    } catch(e) {
        trx.rollback(e);
    }

    await trx.commit();
    return;
}
