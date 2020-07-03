const {  writer } = require("../pool")
const tables = require("../tables")

module.exports = async (msg, category) => {
    try {
        writer(tables.logs).insert({
            message: msg,
            category: category
        })
    } catch(e) {
        throw new Error(e)
    }
    
}