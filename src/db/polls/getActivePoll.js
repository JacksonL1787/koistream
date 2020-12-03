const { reader } = require("../pool")
const tables = require("../tables")
const getActivePollId = require("./getActivePollId")

module.exports = async (userGoogleId) => {
    const pollId = await getActivePollId()
    if(!pollId) return false;
    let poll = await reader
        .select([
            `question`
        ])
        .from(tables.pollTemplates)
        .where("active", true)
    poll = poll[0]
    const options = await reader
            .select([
                `id`,
                `value`
            ])
            .from(tables.pollOptions)
            .where("poll_id", pollId)
    poll.options = options
    let userAnswered = await reader
        .select(`*`)
        .from(tables.pollAnswers)
        .where("user", userGoogleId)
        .andWhere("poll_id", pollId)
    poll.userAnswered = userAnswered.length ? true : false
    return poll;
}