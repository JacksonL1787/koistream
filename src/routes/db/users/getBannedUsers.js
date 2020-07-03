const getUsers = require('./getUsers')


module.exports = async (db) => {
    const users = await getUsers(db);
    const bannedUsers = users.filter(u => u.banned===true)
    return bannedUsers
}