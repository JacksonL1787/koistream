module.exports = async (db) => {
    const getUsers  = () => {
        return new Promise((resolve,reject) => {
            db.collection('users').find({}).toArray((err,data) => {
                err ? reject(err) : resolve(data)
            })
        })
    }

    const users = await getUsers();
    return users
}