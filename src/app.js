require('dotenv').config()
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const app = express();
const flash = require('connect-flash');
const cookieSession = require('cookie-session')
const bodyParser = require('body-parser')
const passport = require('passport')
const colors = require("colors")
const randomstring = require('randomstring')
const session = require('express-session')
const pgSession = require('connect-pg-simple')(session)
const expressip = require('express-ip');
const logSymbols = require('log-symbols');

const AWS = require("aws-sdk");

AWS.config.update({accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, region: 'us-west-2'});

var multer = require('multer');

const passportSetup = require('./config/passport-setup')

const userConnect = require('./db/socketConnections/userConnect')
const userDisconnect = require('./db/socketConnections/userDisconnect')
const resetUserStatuses = require('./db/socketConnections/resetUserStatuses')();
const getUserAuth = require('./db/users/getUserAuth')

var indexRouter = require('./routes/index');
var authRouter = require('./routes/auth/auth');
var apiRouter = require('./routes/api')
var adminRouter = require('./routes/admin/admin')
var adminAPIRouter = require('./routes/admin/api');
const { exec } = require('child_process');


var storage_errorCap = multer.diskStorage({
  destination: 'src/static/img/uploads/errors/index',
  filename: function(req, file, cb) {
    cb(null, "error_capture" + '-' + Date.now() + '-' + randomstring.generate() + '.jpg');
  }
})

var upload_errorCap = multer({ storage: storage_errorCap })

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '..', 'bin')));
app.use(express.static(path.join(__dirname, '..', 'libs')));
app.use(expressip().getIpInfoMiddleware);

let sessionMiddleware = session({
  secret:"58585858585858",
  key: "connect.sid",
  resave: false,
  saveUninitialized: false,
  store: new pgSession({
    conString : `pg://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/${process.env.DB_NAME}`
  })
})

app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/api', apiRouter)
app.use('/admin', adminRouter)
app.use('/admin/api', adminAPIRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

const port = 3000
const server = app.listen(port, () => 
  console.log(logSymbols.success, 'KoiStream Web Server started on port '+ port + "!")
);

const io = require('socket.io').listen(server);
app.set('socketio', io)

io.use(function(socket, next){
  sessionMiddleware(socket.request, {}, next);
})

io.on('connection', async (socket) => {
  if(socket.request.session.passport) {
    if(socket.request.session.passport.user) {
      const url = socket.request.headers.referer
      const socketId = socket.id
      const googleId = socket.request.session.passport.user;
      await userConnect(googleId, url, socketId)
      const auth = await getUserAuth(googleId)
      if(auth === 3) {
        socket.join("admin")
      }
    }
  }
  
  
  socket.on("disconnect", async () => {
    if(socket.request.session.passport) {
      if(socket.request.session.passport.user) {
        const url = socket.request.headers.referer
        const socketId = socket.id
        const googleId = socket.request.session.passport.user;
        await userDisconnect(googleId, socketId)
      }
    }
  })
})

AWS.config.getCredentials(function(err) {
  if (err) console.log(err.stack);
  else {
      console.log("Access key:", AWS.config.credentials.accessKeyId);
      console.log("Region: ", AWS.config.region);
  }
});

module.exports = app;
