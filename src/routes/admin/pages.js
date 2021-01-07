var express = require('express');
var router = express.Router();

const getUserName = require("../../db/users/getUserName")

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

router.get('/stream', authCheck, (req, res) => {
    res.render('admin/main', { page:"Stream", title: 'Stream'});
});

router.get('/users', authCheck, (req, res) => {
    res.render('admin/main', { page:"Users", title: 'Users'});
});

router.get('/interactions', authCheck, (req, res) => {
    res.render('admin/main', { page:"Interactions", title: 'Interactions'});
});

router.get('/inspect/user/:googleId', authCheck, async (req, res) => {
    let googleId = req.params.googleId
    let name = await getUserName(googleId)
    if(!name) return res.sendStatus(404)
    res.render('admin/inspect-user', {googleId, name});
});

module.exports = router;
