var express = require('express');
var router = express.Router();

const getAllParticipants = require('../db/stream/getAllParticipants')
const getLogs = require('../../db/logs/getLogs')
const getStream = require('../db/stream/getStream')


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
    const db = req.app.get("db")
    async function getData() {
        var arr1 = await db.collection('siteControls').find({}).toArray()
        var arr2 = await db.collection('users').find({}).toArray()
        var dataTracking = await db.collection('data_tracking').find({"ident": "viewers"}).toArray()
        var arr3 = await getStream(db)
        var arr4 = await getAllParticipants(db)
        res.render('admin/home', { title: 'Current Stream', viewersArr: JSON.stringify(dataTracking), userArr: JSON.stringify(arr2), controlArr: JSON.stringify(arr1), user: JSON.stringify(req.user), stream: JSON.stringify(arr3), allParticipants: JSON.stringify(arr4) });
    } 
    getData()
});

router.get('/chat', authCheck, async function(req, res, next) {
    res.render('admin/home', { title: 'Chat Moderation'});
});

router.get('/viewers', authCheck, async function(req, res, next) {
    const db = req.app.get('db')
    const allParticipants = await getAllParticipants(db)
    res.render('admin/home', { title: 'Viewers', allParticipants: JSON.stringify(allParticipants)});
});

router.get('/users', authCheck, async function(req, res, next) {
    const db = req.app.get('db')
    res.render('admin/home', { title: 'Users'});
});

router.get('/logs', authCheck, async function(req, res, next) {
    const logs = await getLogs()
    res.render('admin/home', { title: 'Logs', logs: JSON.stringify(logs)});
});

module.exports = router;
