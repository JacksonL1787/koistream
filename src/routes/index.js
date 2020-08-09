var express = require('express');
var router = express.Router();
var moment = require('moment');
const getUserSettings = require('../db/userSettings/getUserSettings')

/* GET home page. */
router.get('/', async function(req, res, next) {
  const io = req.app.get('socketio')
  if(!req.user) {
    res.redirect("/login")
  } else {
    if(req.user.banned) {
      res.redirect('/banned')
    }
    const userSettings = await getUserSettings()
    const allowUnverifiedLogins = userSettings.allowAll
    if(req.user.auth > 0 || allowUnverifiedLogins) {
      res.render('index/index', { title: 'KoiStream'});
    } else {
      res.redirect('auth/redirect')
    }
  }
});

router.get('/privacy', function(req, res, next) {
  res.render('privacy', { title: 'Privacy' });
});


router.get('/banned', function(req, res, next) {
  if(!req.user) {
    res.redirect("/login")
  } else {
    if(req.user.banned) {
      res.render('banned', { title: 'Banned' , user: JSON.stringify(req.user)});
    } else {
      res.redirect("/")
    }
  }
});

router.get('/login', async function(req, res, next) {
  if(req.user) {
    res.redirect('/')
  } else {
    const userSettings = await getUserSettings()
    const allowUnverifiedLogins = userSettings.allowAll
    console.log(allowUnverifiedLogins)
    res.render('login', { title: 'Login', allowAll: allowUnverifiedLogins});
  }
});

router.get('/pendingApproval', async function(req, res, next) {
  if(req.user) {
    const userSettings = await getUserSettings()
    const allowUnverifiedLogins = userSettings.allowAll
    if(req.user.auth == 0 && !allowUnverifiedLogins) {
      res.render('pendingApproval',{ title: 'Pending Approval' })
    } else {
      res.redirect('/auth/redirect')
    }
  } else {
    res.redirect('/')
  }
})

module.exports = router;
