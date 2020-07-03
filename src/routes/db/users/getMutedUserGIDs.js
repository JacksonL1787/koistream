module.exports = async (db) => {
    const getMutedUsers  = () => {
        return new Promise((resolve,reject) => {
            db.collection('users').find({muted: true}, {projection:{googleId:1, _id:0}}).toArray((err,data) => {
                err ? reject(err) : resolve(data)
            })
        })
    }

    const mutedUsers = await getMutedUsers();
    return mutedUsers;
}