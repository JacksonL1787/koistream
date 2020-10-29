const { reader } = require("../pool")
const tables = require("../tables")
const getActivePollId = require("./getActivePollId")

module.exports = async () => {
    let pollId = await reader.raw(`SELECT * FROM ${tables.polls} ORDER BY time_start DESC FETCH FIRST ROW ONLY;`)
    if(!pollId.rows[0]) return false;
    pollId = pollId.rows[0].id
    let options = await reader
        .select([
            `number`,
            `value`
        ])
        .from(tables.pollOptions)
        .where("poll_id", pollId)
    options.forEach((o) => {
        o.count = 0;
    })
    let answers = await reader
        .select([
            'poll_option_number'
        ])
        .from(tables.pollAnswers)
        .where("poll_id", pollId)
    answers.forEach((a) => {
        options[a.poll_option_number - 1].count++
    })
    return options;
}