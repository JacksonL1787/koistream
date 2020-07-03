module.exports = (db, streamId) => {
    db.collection("streams").deleteOne({
        streamId: streamId
    })
}