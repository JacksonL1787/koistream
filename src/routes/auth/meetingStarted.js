module.exports = (req,res,next) => {
    if(true) {
        next()
    } else {
        res.redirect("/countdown")
    }
}