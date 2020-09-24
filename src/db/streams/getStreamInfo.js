const { reader } = require("../pool")
const tables = require("../tables")

module.exports = async () => {
    let stream = await reader
        .select([
            `${tables.streams}.title`
        ])
        .from(tables.streams)
        .where(`${tables.streams}.active`, true)
    stream = stream[0]
    return stream;
}