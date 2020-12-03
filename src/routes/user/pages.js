const express = require('express');
const router = express.Router();
const _ = require("lodash")

const authCheck = (req, res, next) => {
  if(!req.user) {
      res.redirect('/')
  } else {
      next();
  }
}

/* GET home page. */
router.get('/', (req, res, next) => {
  let user = false;
  if(req.user) user = true;
  console.log(user)
  res.render('user/home', { title: 'KoiStream', user, name: user ? _.capitalize(req.user.firstName) : ""});
});

router.get('/stream', authCheck, (req, res, next) => {
  res.render('user/stream', { title: 'KoiStream', auth: req.user.auth, name: _.startCase(req.user.firstName + " " + req.user.lastName), profilePicture: req.user.googleProfilePicture});
});

router.get('/settings', authCheck, (req, res, next) => {
  if(req.user.auth != 3) res.redirect("/")
  res.render('user/settings', { title: 'Settings'});
});

module.exports = router;
