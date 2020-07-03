const { writer } = require("../pool")
const tables = require("../tables")



module.exports = async (googleId, online, page, socketId) => {
    if(page != null) {
        let urls = [
            "https://dev.community.designtechhs.com",
            "http://dev.community.designtechhs.com",
            "https://community.designtechhs.com",
            "http://community.designtechhs.com"
        ]
        urls.forEach((u) => {
            page = page.replace(u, "")
        })
    }
    console.log(googleId, online, page, socketId)
    return await writer(tables.users)
        .where(`${tables.users}.googleId`, googleId)
        .update({
            online: online,
            currentPage: page,
            socketId: socketId
        });
}
