const { reader } = require("../pool")
const tables = require("../tables")

module.exports = async () => {
    let viewers = await reader.raw(`
        SELECT
            DISTINCT ON ("${tables.socketConnections}"."googleId") "${tables.socketConnections}"."googleId",
            ${tables.users}."firstName",
            ${tables.users}."lastName",
            ${tables.users}.email
        FROM "${tables.socketConnections}"
        JOIN ${tables.users} on "${tables.socketConnections}"."googleId" = ${tables.users}."googleId"
        WHERE page = '/stream'
        ORDER BY
            "googleId"
    `)
    console.log(viewers)
    return viewers.rows;
}