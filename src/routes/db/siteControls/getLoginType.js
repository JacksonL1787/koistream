module.exports = async (db) => {
    const getLoginType = () => {
        return new Promise((resolve,reject) => {
            db.collection("siteControls").find({identifier: "loginType"}, {projection: {_id: 0, loginType: 1}}).toArray((err,data) => {
                resolve(data[0].loginType)
            })
        })
    }

    return await getLoginType();
}