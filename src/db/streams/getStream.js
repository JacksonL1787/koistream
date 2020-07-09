const { reader } = require("../pool")
const tables = require("../tables")

module.exports = async () => {
    let stream = await reader
        .select([
            `${tables.streams}.title`,
            `${tables.streams}.runner`,
            `${tables.streams}.streamId`,
            `${tables.streams}.startTime`,
            `${tables.streams}.endTime`,
            `${tables.streams}.active`,
            `${tables.users}.firstName`,
            `${tables.users}.lastName`,
            `${tables.users}.googleId`,
            `${tables.users}.googleProfilePicture`
        ])
        .from(tables.streams)
        .join(tables.users, `${tables.users}.googleId`, `${tables.streams}.startedBy`)
        .where(`${tables.streams}.active`, true)
    return stream[0];
}