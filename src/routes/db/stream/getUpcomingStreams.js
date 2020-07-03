module.exports = async (db) => {
    const getUpcomingStreams  = () => {
        return new Promise((resolve,reject) => {
            db.collection('streams').find({}).toArray((err,data) => {
                err ? reject(err) : resolve(data)
            })
        })
    }

    let upcomingStreams = await getUpcomingStreams();
    upcomingStreams = upcomingStreams.filter(x => !x.active && !x.finished)
    return upcomingStreams
}