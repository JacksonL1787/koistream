const { reader, writer } = require("../pool")
const tables = require("../tables")
const randomstring = require("randomstring")
const getActiveStream = require("../streams/getActiveStream")
const isPollActive = require("./isPollActive")

module.exports = async (data) => {
    const activePoll = await isPollActive()
    if(activePoll) return false;
    const activeStream = await getActiveStream()
    if(!activeStream.streamId) return false;
    const trx = await writer.transaction();
    const pollId = randomstring.generate()
    try {
        await trx(tables.polls)
        .insert({
            id: pollId,
            question: data.question,
            active: true, 
            active_stream_id: activeStream.streamId
        })
    } catch(e) {
        console.log(e)
        trx.rollback(e)
    }

    try {
        let count = 1;
        console.log(data)
        data.options.forEach((o) => {
            o.poll_id = pollId;
            o.number = count;
            count++;
        })
        await trx(tables.pollOptions)
            .insert(data.options)
    } catch(e) {
        console.log(e)
        trx.rollback(e)
    }

    await trx.commit()
    return true;
}