const { writer, reader } = require("../pool")
const tables = require("../tables")

module.exports = async (data) => {
    const info = await writer(tables.stream)
        .update({title: data.title, description: data.description})
        
    return true;
}