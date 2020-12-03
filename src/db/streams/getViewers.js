const { reader } = require("../pool")
const tables = require("../tables")

module.exports = async () => {
    let viewers = await reader.raw(`
        SELECT
            DISTINCT ON ("socketConnections"."googleId") "socketConnections"."googleId",
            "socketConnections".timestamp,
            users."firstName",
            users."lastName",
            users.email,
            users."googleProfilePicture"
        FROM "socketConnections"
        JOIN users on "socketConnections"."googleId" = users."googleId"
        WHERE page = '/stream'
        ORDER BY
            "googleId"
    `)
    return viewers.rows;
}