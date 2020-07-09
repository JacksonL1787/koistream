const { reader} = require("../pool")
const tables = require("../tables")
const _ = require("lodash")

module.exports = async (googleId) => {
    let name = await reader
        .select('firstName', 'lastName')
        .from(tables.users)
        .where("googleId", googleId)
    if(!name.length) return false;
    name = name[0]
    name = _.startCase(name.firstName + " " + name.lastName)
    return name;
}