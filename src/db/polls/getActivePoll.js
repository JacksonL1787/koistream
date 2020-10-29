const { reader, writer } = require("../pool")
const tables = require("../tables")
const isPollActive = require("./isPollActive")

module.exports = async (userGoogleId) => {
    const activePoll = await isPollActive()
    if(!activePoll) return false;
    let poll = await reader
        .select([
            `question`,
            `id`
        ])
        .from(tables.polls)
        .where("active", true)
    poll = poll[0]
    const options = await reader
            .select([
                `number`,
                `value`
            ])
            .from(tables.pollOptions)
            .where("poll_id", poll.id)
    poll.options = options
    let userAnswered = await reader
        .select(`*`)
        .from(tables.pollAnswers)
        .where("user_id", userGoogleId)
        .andWhere("poll_id", poll.id)
    poll.userAnswered = userAnswered.length ? true : false
    delete poll.id;
    return poll;
}