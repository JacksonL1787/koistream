const { writer, reader } = require("../pool")
const tables = require("../tables")
const randomstring = require("randomstring")

module.exports = async (data) => {
    let tag = await writer(tables.chatTags)
        .insert({
            tag_name: data.name,
            tag_color: data.color
        })
        .returning("*")
    return tag[0];

}