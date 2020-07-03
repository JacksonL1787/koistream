module.exports = (db, googleId, mute) => {
    db.collection("users").updateOne({googleId: googleId}, {$set: {muted: mute}})
}