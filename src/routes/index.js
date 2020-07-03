var express = require('express');
var router = express.Router();
var moment = require('moment');

const authMeetingStarted = require('./auth/meetingStarted')
const getIndexStream = require('./db/stream/getIndexStream')
const getSiteControls = require('./db/siteControls/getSiteControls')
const getEmojis = require('../db/emojis/getEmojis')
const getLoginType = require('./db/siteControls/getLoginType')

/* GET home page. */
router.get('/', authMeetingStarted, async function(req, res, next) {
  const db = req.app.get('db')
  const io = req.app.get('socketio')
  if(!req.user) {
    res.redirect("/login")
  } else {
    if(req.user.banned) {
      res.redirect('/banned')
    }
    const loginType = await getLoginType(db)
    if(req.user.auth > 0 || loginType === "allowAll") {
      var siteControls = await getSiteControls(db)
      var indexStream = await getIndexStream(db, req.user)
      const emojis = await getEmojis(db)
      res.render('index/index', { title: 'KoiStream', "emojis": JSON.stringify(emojis), "user": JSON.stringify(req.user), "controlArr": JSON.stringify(siteControls), "stream": JSON.stringify(indexStream)});
    } else {
      res.redirect('auth/redirect')
    }
  }
});

router.get('/new-login', (req,res,next) => {
  if(!req.user) {
    res.redirect("/")
  } else {
    res.render('new-login', {title: "New Login"})
  }
})

router.get('/countdown', function(req, res, next) {
  const db = req.app.get('db')
  async function getData() {
    var streamState = await db.collection('siteControls').find({"identifier": "streamState"}).toArray()
    var upcomingStreams = await db.collection('upcomingStreams').find({}).toArray()
    if(!streamState[0].state) {
      var allStreams = []
      for(var i = 0; i < upcomingStreams.length; i++) {
        var time = moment(upcomingStreams[i].startTime).valueOf()
        var id = upcomingStreams[i].streamId
        allStreams.push(time)
      }
      var lowestVal = Math.min.apply( Math, allStreams )
      var sel = allStreams.indexOf(lowestVal)
      res.render('countdown', { title: 'Countdown', nextStream: JSON.stringify(upcomingStreams[sel]) });
    } else {
      res.redirect('/')
    }
  } 
  getData()
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

router.get('/check', async function(req,res,next) {
  res.redirect('/login')
})

router.get('/login', authMeetingStarted, async function(req, res, next) {
  if(req.user) {
    res.redirect('/')
  } else {
    const db = req.app.get('db')
    const loginType = await getLoginType(db)
    res.render('login', { title: 'Login', allowAll: loginType === "allowAll"});
  }
});

router.get('/pendingApproval', async function(req, res, next) {
  if(req.user) {
    const db = req.app.get("db")
    const loginType = await getLoginType(db)
    if(req.user.auth == 0 && loginType != "allowAll") {
      res.render('pendingApproval',{ title: 'Pending Approval' })
    } else {
      res.redirect('/auth/redirect')
    }
  } else {
    res.redirect('/')
  }
})

module.exports = router;
