const { reader } = require("../pool")
const tables = require("../tables")

module.exports = async () => {
    let viewers = await reader.raw(`
        SELECT
            DISTINCT "socketConnections"."googleId", users."googleProfilePicture","socketConnections".timestamp, users.email, users."firstName", users."lastName", users.email
        FROM "socketConnections"
        JOIN users on "socketConnections"."googleId" = users."googleId"
        WHERE page = '/';
    `)
    return viewers.rows;
}