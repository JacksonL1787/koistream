const { stubTrue } = require("lodash")
const { reader, writer } = require("../pool")
const tables = require("../tables")

module.exports = async () => {
    const poll = await writer(tables.pollTemplates)
        .update({
            active: true
        })
        .where("active", false)
    return true;
}