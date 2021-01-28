const {writer, reader} = require("../pool")
const tables = require("../tables")

module.exports = async (data) => {
    data.val = data.val.toLowerCase()
    console.log(data)
    if(!data.val.trim().length && data.filters.muted === "false" && data.filters.onlydtech === "false" && data.filters.admin === "false" && data.filters.notdtech === "false") return "prompt search";
    if(data.filters.onlydtech != "false" && data.filters.onlydtech != "true") return [];
    if(data.filters.notdtech != "false" && data.filters.notdtech != "true") return [];
    if(data.filters.muted != "false" && data.filters.muted != "true") return [];
    if(data.filters.admin != "false" && data.filters.admin != "true") return [];
    if(data.filters.onlydtech === "true" && data.filters.notdtech === "true") return [];
    const commonFilterString = `${data.filters.admin === 'true' ? " AND auth > 1" : ""}${data.filters.muted === 'true' ? " AND muted = true" : ""}${data.filters.onlydtech === 'true' ? " AND LOWER(email) LIKE '%@dtechhs.org'" : ""}${data.filters.notdtech === 'true' ? " AND LOWER(email) NOT LIKE '%@dtechhs.org'" : ""}`
    const users = await reader
        .select([
            'firstName',
            'lastName',
            'googleId',
            'email'
        ])
        .from(tables.users)
        .where(reader.raw(`
            LOWER(CONCAT("firstName", ' ', "lastName")) 
            LIKE '${data.val}%'${commonFilterString} 
            OR LOWER(email) LIKE '${data.val}%'${commonFilterString} 
            OR LOWER("lastName") LIKE '${data.val}%'${commonFilterString}`))
    return users;
}