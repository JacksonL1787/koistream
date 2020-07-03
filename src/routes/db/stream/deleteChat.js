module.exports = (db, chatID) => {
    db.collection("streams").updateOne({"active": true},{ "$pull": {"liveChats": {chatID: chatID}} } )
}