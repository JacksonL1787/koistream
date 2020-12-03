const router = require('express').Router();
const passport = require('passport');

router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}))

router.get('/googleRedirect',  passport.authenticate('google'), (req, res, next) => {
    if(req.user) {
        res.redirect('/stream')
    } else {
        res.redirect('/')
    }
})

router.get('/redirect', async (req, res, next) => {
    if(req.user) {
        res.redirect('/stream')
    } else {
        res.redirect('/')
    }
})

router.get('/logout', (req, res, next) => {
    req.logout()
    res.redirect('/')
})

module.exports = router;