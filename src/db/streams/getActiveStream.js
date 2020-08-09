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
    stream = stream[0]    
    stream.slates = await reader
        .select([
            `${tables.slateTypes}.type`,
            `${tables.slateTypes}.src`,
            `${tables.slateTypes}.name`,
            `${tables.slate}.active`
        ])
        .from(tables.slateTypes)
        .leftJoin(`${tables.slate}`, `${tables.slate}.type`, "=", `${tables.slateTypes}.type`)
        .orderBy(`${tables.slateTypes}.type`)
    return stream;
}