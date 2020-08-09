const { writer } = require('../pool')
const tables = require('../tables')

module.exports = async (status) => {
    const settings = await writer(tables.chatSettings)
            .update({
                status: status
            });
    return;
}
