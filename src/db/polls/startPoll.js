const { reader, writer } = require("../pool")
const tables = require("../tables")
const getActivePollId = require("./getActivePollId")
const randomstring = require("randomstring")
const getPollTemplate = require("../pollTemplates/getPollTemplate")

module.exports = async (templateId) => {
    console.log(templateId)
    const activePollId = await getActivePollId()
    if(activePollId) return false;

    let pollTemplate = await getPollTemplate(templateId)
    if(!pollTemplate) return false;

    const trx = await writer.transaction();
    const newPollId = randomstring.generate();
    try {
        await trx(tables.polls)
        .insert({
            id: newPollId,
            question: pollTemplate.question
        })
    } catch(e) {
        console.log(e)
        trx.rollback(e)
    }

    try {
        let options = [];
        pollTemplate.options.forEach((o) => {
            options.push({
                poll_id: newPollId,
                id: randomstring.generate(),
                value: o.value
            })
        })
        await trx(tables.pollOptions)
            .insert(options)
    } catch(e) {
        console.log(e)
        trx.rollback(e)
    }

    await trx.commit()
    return true;
}