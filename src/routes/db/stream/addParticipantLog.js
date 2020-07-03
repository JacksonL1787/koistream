const getUserByGoogleId = require("../users/getUserByGoogleId")

module.exports = async (db, type, googleId) => {
    const user = await getUserByGoogleId(db, googleId)
    const fullName = 
            user.firstName[0].toUpperCase() + user.firstName.slice(1) + " " +
            user.lastName[0].toUpperCase() + user.lastName.slice(1)
    const data = {
        type: type,
        googleId: googleId,
        email: user.email,
        name: fullName,
        timestamp: Date.now()
    }
    db.collection("streams").updateOne({"active": true}, 
        {
            $push: {
                participantLogs: data
            }
        }   
    )
    return data
}