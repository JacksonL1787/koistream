const { reader } = require("../pool")
const tables = require("../tables")

module.exports = async () => {
    let count = await reader.raw(`
        SELECT COUNT(DISTINCT "googleId")
        FROM "socketConnections"
        WHERE page = '/';
    `)
    return count.rows[0].count;
}