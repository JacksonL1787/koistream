const {writer, reader} = require("../pool")
const tables = require("../tables")

module.exports = async (filter) => {
    filter.search = filter.search.toLowerCase()
    const commonFilterString = `${filter.banned ? " AND banned = true" : ""}${filter.muted ? " AND muted = true" : ""}`
    const users = await reader
        .select('*')
        .from(tables.users)
        .where(reader.raw(`LOWER(CONCAT("firstName", ' ', "lastName")) LIKE '${filter.search}%'${commonFilterString} OR LOWER(email) LIKE '${filter.search}%'${commonFilterString} OR LOWER("lastName") LIKE '${filter.search}%'${commonFilterString}`))
    return users;
}