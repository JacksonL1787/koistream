var express = require('express');
var router = express.Router();

const getLogs = require('../../db/logs/getLogs')
const getUserName = require('../../db/users/getUserName')

const authCheck = (req, res, next) => {
    if(req.user) {
        if(req.user.auth >= 2) {
            next()
        } else {
            res.redirect('/auth/redirect')
        }
    } else {
        res.redirect('/')
    }
}

router.get('/errors', authCheck, (req, res, next) => {
    const db = req.app.get("db")
    async function getData() {
        var arr1 = await db.collection('errors').find({}).toArray()
        res.render('admin/home', {title: 'Error Tracking', errorsArr: JSON.stringify(arr1)})
    } 
    getData()
})

router.get('/current-stream', authCheck, function(req, res, next) {
    res.render('admin/home', { page:"Current Stream", title: 'Current Stream'});
});

router.get('/chat', authCheck, async function(req, res, next) {
    res.render('admin/home', { page:"Chat Moderation", title: 'Chat Moderation'});
});

router.get('/viewers', authCheck, async function(req, res, next) {
    const db = req.app.get('db')
    const allParticipants = await getAllParticipants(db)
    res.render('admin/home', { title: 'Viewers', allParticipants: JSON.stringify(allParticipants)});
});

router.get('/users', authCheck, async function(req, res, next) {
    res.render('admin/home', {page: "Users", title: 'Users'});
});

router.get('/u/:googleId', authCheck, async function(req, res, next) {
    const googleId = req.params.googleId
    const name = await getUserName(googleId)
    res.render('admin/home', { page: "Profile", title: `${name}'s Profile`, googleId: googleId});
});

router.get('/logs', authCheck, async function(req, res, next) {
    const logs = await getLogs()
    res.render('admin/home', {page: "Logs", title: 'Logs', logs: JSON.stringify(logs)});
});

module.exports = router;
