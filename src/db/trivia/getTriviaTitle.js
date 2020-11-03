const { reader, writer } = require("../pool")
const tables = require("../tables")

module.exports = async () => {
    let title = await reader.select("title").from(tables.triviaTemplates).where("active", true)
    title = title.length ? title[0].title : false
    return title;
}