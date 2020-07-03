module.exports = async (db) => {
    const getChatSettings  = () => {
        return new Promise((resolve,reject) => {
            db.collection("streams").findOne({"active": true}, 'chatSettings', function(err,doc) {
                resolve(doc.chatSettings)
            })
        })
    }

    return await getChatSettings()
}