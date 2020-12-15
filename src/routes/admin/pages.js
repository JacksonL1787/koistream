var express = require('express');
var router = express.Router();


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

module.exports = router;
