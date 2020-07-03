require('dotenv').config()
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const app = express();
const mongoose = require('mongoose')
const flash = require('connect-flash');
const cookieSession = require('cookie-session')
const bodyParser = require('body-parser')
const passport = require('passport')
const colors = require("colors")
const randomstring = require('randomstring')
const session = require('express-session')
const pgSession = require('connect-pg-simple')(session)

var multer = require('multer');

const passportSetup = require('./config/passport-setup')

const setUserStatus = require('./db/users/setUserStatus')

var indexRouter = require('./routes/index');
var authRouter = require('./routes/auth/auth');
var apiRouter = require('./routes/api')
var adminRouter = require('./routes/admin/admin')
var adminAPIRouter = require('./routes/admin/api')
 
mongoose.connect(`mongodb://localhost:27017/DesignTechHS`, {useNewUrlParser: true, useUnifiedTopology: true}, (err, client) => {
  if(err) {
    console.log('    ')
    console.log(' DB Alert '.bgRed.white.bold + '  There was an issue connecting to the database.'.bold.red)
    console.log('    ')
    console.log(' DB Alert '.bgRed.white.bold + '  DB error has been added to logs, shutting down server'.bold.red)
    console.log('    ')
    console.log(err)
    server.close()
  } else {
    console.log('    ')
    console.log('DesignTechHS Database Online')
    console.log('DesignTechHS Database Connection Successful')
    console.log('    ')
  }
  app.set('db', client)
});


var storage_errorCap = multer.diskStorage({
  destination: 'src/static/img/uploads/errors/index',
  filename: function(req, file, cb) {
    cb(null, "error_capture" + '-' + Date.now() + '-' + randomstring.generate() + '.jpg');
  }
})

var upload_errorCap = multer({ storage: storage_errorCap })
 
app.post('/tst/uploadfile', upload_errorCap.single('blob'), (req, res, next) => {
  const file = req.file
  if (!file) {
    res.sendStatus(393)
  } else {
    mongoose.connect(`mongodb://localhost:27017/DesignTechHS`, {useNewUrlParser: true, useUnifiedTopology: true}, (err, client) => {
      client.collection('errors').updateOne({"errorID": req.body.id}, {$push : {"errorCaptures" : {"errorCapture": req.file.filename, "timestamp": req.body.timestamp}}})
    })
    res.sendStatus(200)
  }
})


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '..', 'bin')));
app.use(express.static(path.join(__dirname, '..', 'libs')));

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
const server = app.listen(port, () => console.log('DTECH Community webserver started on port '+ port + "!"));
console.log('DTECH Community is now accessible from https://community.designtechhs.com')

const io = require('socket.io').listen(server);
app.set('socketio', io)

let connectedUsers = 0

io.use(function(socket, next){
  sessionMiddleware(socket.request, {}, next);
})

io.on('connection', async (socket) => {
  if(socket.request.session.passport) {
    const url = socket.request.headers.referer
    const socketId = socket.id
    const googleId = socket.request.session.passport.user;
    await setUserStatus(googleId, true, url, socketId)
  }
  
  socket.on("disconnect", async () => {
    if(socket.request.session.passport) {
      const url = socket.request.headers.referer
      const socketId = socket.id
      const googleId = socket.request.session.passport.user;
      await setUserStatus(googleId, false, null, null)
    }
  })
})


var dataCollectionDBLength = 50

function updateSiteClients(data) {
  console.log('updating data_tracking')
  mongoose.connect(`mongodb://localhost:27017/DesignTechHS`, {useNewUrlParser: true, useUnifiedTopology: true}, (err, client) => {
    async function getData() {
      var dataTracking = await client.collection('data_tracking').find({"ident": "viewers"}).toArray()
      if(dataTracking[0].data.site_clients.length > dataCollectionDBLength && dataTracking[0].data.stream_clients.length > dataCollectionDBLength) {
        client.collection('data_tracking').updateOne({"tags": "most_recent"}, {$unset : {"data.site_clients.0" : 1 }}) 
        client.collection('data_tracking').updateOne({"tags": "most_recent"}, {$pull : {"data.site_clients" : null}})
        client.collection('data_tracking').updateOne({"tags": "most_recent"}, {$unset : {"data.stream_clients.0" : 1 }}) 
        client.collection('data_tracking').updateOne({"tags": "most_recent"}, {$pull : {"data.stream_clients" : null}})
        
        client.collection('data_tracking').updateOne({"tags": "most_recent"}, { $push: {
          "data.site_clients": data[0],
          "data.stream_clients": data[1]
        }})

      } else {
        client.collection('data_tracking').updateOne({"tags": "most_recent"}, { $push: {
          "data.site_clients": data[0],
          "data.stream_clients": data[1]
        }})
      }
    } 
    getData()
  })
}


module.exports = app;
