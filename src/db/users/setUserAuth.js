const { writer } = require("../pool")
const tables = require("../tables")
const _ = require("lodash")
//const iplocate = require("")

module.exports = async (googleId, admin) => {
    let auth = await writer(tables.users)
        .update({auth: admin ? 3 : 1})
        .where("googleId", googleId)
    return true;
}