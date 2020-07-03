const getUsers = require('./getUsers')


module.exports = async (db, googleId) => {
    const users = await getUsers(db);
    const user = users.filter(u => u.googleId===googleId)
    return user[0]
}