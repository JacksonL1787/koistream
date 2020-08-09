const { writer, reader } = require("../pool")
const tables = require("../tables")
const randomstring = require("randomstring")

module.exports = async (data, googleId) => {

    let activeStreamId = await reader.select("streamId").from(tables.streams).where("active", true)
    console.log(activeStreamId)
    if(activeStreamId.length <= 0) return false;
    activeStreamId = activeStreamId[0].streamId
    console.log(data)
    await writer(tables.errors)
        .insert({
            id: randomstring.generate(), 
            status: 1,
            type: data.type,
            userGoogleId: googleId,
            description: data.description,
            streamId: activeStreamId
        })
    return true;

}