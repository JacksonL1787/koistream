const { reader} = require("../pool")
const tables = require("../tables")
const _ = require("lodash")
//const iplocate = require("")

module.exports = async (googleId) => {
    let auth = await reader
        .select("auth")
        .from(tables.users)
        .where("googleId", googleId)
    auth = auth[0].auth
    return auth;
}