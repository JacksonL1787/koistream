const { writer } = require("../pool")
const tables = require("../tables")

module.exports = async (data) => {
    let info = await writer(tables.streamSettings)
        .update({title: data.title, description: data.description})
    return true;
}