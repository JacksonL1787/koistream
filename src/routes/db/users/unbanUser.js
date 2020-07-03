module.exports = (db,googleId) => {
    db.collection("users").updateOne({
        googleId: googleId
    },
    { "$set": { "banned": false } }
    )
}