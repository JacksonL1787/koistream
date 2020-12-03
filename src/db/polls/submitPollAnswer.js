const { reader, writer } = require("../pool")
const tables = require("../tables")
const getActivePollId = require("./getActivePollId")

module.exports = async (optionId, user) => {
    const pollId = await getActivePollId()
    if(!pollId) return false;
    let userAnswered = await reader
        .select(`*`)
        .from(tables.pollAnswers)
        .where("user", user)
        .andWhere("poll_id", pollId)
    if(userAnswered.length > 0) return false;
    const options = await reader
            .select(`*`)
            .from(tables.pollOptions)
            .where("poll_id", pollId)
            .andWhere("id", optionId)
    if(!options.length) return false;

    const trx = await writer.transaction();
    try {
        await trx(tables.pollAnswers)
            .insert({
                poll_id: pollId,
                user: user,
                option_id: optionId
            })
    } catch(e) {
        console.log(e)
        trx.rollback(e)
    }

    try {
        await trx.raw(`UPDATE "${tables.pollOptions}" SET "voteCount"="voteCount"+1 WHERE id='${optionId}';`)
    } catch(e) {
        console.log(e)
        trx.rollback(e)
    }

    await trx.commit()
    return true;

}