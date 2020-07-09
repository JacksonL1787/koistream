const { writer } = require("../pool")
const tables = require("../tables")
const randomstring = require("randomstring")

module.exports = async (data) => {
    let stream = await writer(tables.streams)
        .update({active: false})
        .where("active", true)
    return;
}