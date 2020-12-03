var express = require('express');
var router = express.Router();

const getLogs = require('../../db/logs/getLogs')
const getUserName = require('../../db/users/getUserName')
const getErrors = require('../../db/errors/getErrors')


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

router.get('/errors', authCheck, async (req, res, next) => {
    res.render('admin/home', {page: "System Errors", title: 'System Errors'});   
})

router.get('/stream', authCheck, function(req, res, next) {
    res.render('admin/home', { page:"Stream", title: 'Stream'});
});

router.get('/chat', authCheck, async function(req, res, next) {
    res.render('admin/home', { page:"Chat Moderation", title: 'Chat Moderation'});
});

router.get('/AWS', authCheck, async (req, res, next) => {
    res.render('admin/home', {page: "AWS", title: 'AWS'});
})

router.get('/viewers', authCheck, async function(req, res, next) {
    res.render('admin/home', { title: 'Viewers', page: "Viewers"});
});

router.get('/users', authCheck, async function(req, res, next) {
    res.render('admin/home', {page: "Users", title: 'Users'});
});

router.get('/polls', authCheck, async function(req, res, next) {
    res.render('admin/home', {page: "Polls", title: 'Polls'});
});

router.get('/trivia', authCheck, async function(req, res, next) {
    res.render('admin/home', {page: "Trivia", title: 'Trivia'});
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
