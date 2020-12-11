const { writer, reader } = require("../pool")
const tables = require("../tables")
const randomstring = require("randomstring")

module.exports = async (data, googleId) => {
    let isType = await reader.select("*").from(tables.errorTypes).where("id", parseInt(data.type))
    if(isType.length === 0) return false;
    await writer(tables.errors)
        .insert({
            id: randomstring.generate(), 
            status: 1,
            type: data.type,
            userGoogleId: googleId,
            description: data.description,
            notes: ""
        })
    return true;

}