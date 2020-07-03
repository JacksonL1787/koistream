module.exports = async (db) => {
    const getSiteControls  = () => {
        return new Promise((resolve,reject) => {
            db.collection("siteControls").find({}).toArray((err,data) => {
                resolve(data)
            })
        })
    }
    siteControls = await getSiteControls();
    return siteControls
}