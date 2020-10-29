const { reader, writer } = require("../pool")
const tables = require("../tables")
const getActivePollId = require("./getActivePollId")

module.exports = async (userGoogleId, option) => {
    const pollId = await getActivePollId()
    if(!pollId) return false;
    let userAnswered = await reader
        .select(`*`)
        .from(tables.pollAnswers)
        .where("user_id", userGoogleId)
        .andWhere("poll_id", pollId)
    if(userAnswered.length) return false;
    const options = await reader
            .select(`*`)
            .from(tables.pollOptions)
            .where("poll_id", pollId)
            .andWhere("number", option)
    if(!options.length) return false;

    let vote = await writer(tables.pollAnswers)
        .insert({
            poll_id: pollId,
            user_id: userGoogleId,
            poll_option_number: option
        })
    return true;
}