const { reader } = require("../pool")
const tables = require("../tables")

module.exports = async () => {
    let slate = await reader
        .select([
            `${tables.slate}.active`,
            `${tables.slate}.type`,
            `${tables.slateTypes}.name`,
            `${tables.slateTypes}.src`
        ])
        .from(tables.slate)
        .join(tables.slateTypes, `${tables.slateTypes}.type`, '=', `${tables.slate}.type`)
    return slate[0];
}