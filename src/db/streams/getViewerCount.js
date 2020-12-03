const { reader } = require("../pool")
const tables = require("../tables")

module.exports = async () => {
    let count = await reader.raw(`
        SELECT COUNT(DISTINCT "googleId")
        FROM "${tables.socketConnections}"
        WHERE page = '/stream';
    `)
    return count.rows[0].count;
}