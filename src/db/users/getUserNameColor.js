const { reader} = require("../pool")
const tables = require("../tables")

module.exports = async (id) => {
    let color = await reader
        .select({
            color: `${tables.nameColors}.color`
        })
        .from(tables.nameColors)
        .where("id", id)
    color = color[0].color
    return color;
}