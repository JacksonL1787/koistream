const { writer, reader } = require("../pool")
const tables = require("../tables")

module.exports = async (title) => {
    const newTitle = await writer(tables.streams)
        .update({title: title})
        .where("active", true)
    return;
}