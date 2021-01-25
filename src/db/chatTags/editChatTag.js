const { writer, reader } = require("../pool")
const tables = require("../tables")

module.exports = async (data) => {
    let isTag = await reader.select("*").from(tables.chatTags).where("id", parseInt(data.id))
    if(isTag.length === 0) return false;
    let tag = await writer(tables.chatTags)
        .update({
            tag_name: data.name,
            tag_color: data.color
        })
        .where("id", parseInt(data.id))
        .returning("*")
    return tag[0];
}