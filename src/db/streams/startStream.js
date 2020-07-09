const { writer } = require("../pool")
const tables = require("../tables")
const randomstring = require("randomstring")

module.exports = async (data, googleId) => {
    let stream = await writer
        .insert({
            title: data.title,
            runner: data.runner,
            streamId: randomstring.generate(),
            active: true,
            startedBy: googleId
        })
        .into(tables.streams)
        .returning("*")
    return stream[0];
}