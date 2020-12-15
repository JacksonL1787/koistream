const { reader, writer } = require("../pool")
const tables = require("../tables")

module.exports = async (id) => {
    let pollTemplate = await reader.select("*").from(tables.pollTemplates).where("id", id)
    if(pollTemplate.length === 0) return false;
    pollTemplate = pollTemplate[0]
    pollTemplate.options = await reader.select(["value"]).from(tables.pollTemplateOptions).where("poll_template_id", id)
    return pollTemplate;
}