const { writer } = require('../pool')
const tables = require('../tables')

module.exports = async (status, cooldown) => {
    const settings = await writer(tables.chatSettings)
            .update({
                status: status,
                cooldown: cooldown
            });
    return;
}
