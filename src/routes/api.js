const express = require('express');
const router = express.Router();
const randomstring = require("randomstring")
const { check } = require('express-validator');

const _ = require("lodash")

var multer  = require('multer');
var upload = multer();


const addChat = require('../db/liveChats/addChat')
const getChatSettings = require('../db/chatSettings/getChatSettings')
const updateLastChatTime = require('../db/users/updateLastChatTime')
const getEmojis = require('../db/emojis/getEmojis')
const getChats = require('../db/liveChats/getChats')
const getSlate = require('../db/slate/getSlate')
const getStream = require('../db/streams/getStream')

const authCheck = (req, res, next) => {
    if(req.user) {
        if(req.user.auth > 0) {
            next()
        }
    } else {
        res.send(404)
    }
}

// Stream Configuration

router.post('/a/stream/configuration', authCheck, function(req, res, next) {
    if(req.user.auth > 1) {
        const db = req.app.get("db")
        db.collection("streams").updateOne({"active": true}, {$set: {"runner": req.body.runner, "name": req.body.title}})
        res.json({"code": 200, "message": "success"})
    } else {
        res.json({"code": 358, "message": "prohibited, you do not have sufficient permissions"})
    }
})

// DB Clears

router.post('/c/db/errors', authCheck, function(req, res, next){
    if(req.user.auth > 1) {
        const db = req.app.get("db")
        db.collection("errors").remove()
        res.json({"code": 200, "message": "success"})
    } else {
        res.json({"code": 358, "message": "prohibited, you do not have sufficient permissions"})
    }
})


router.post('/chat/sendMessage', [
    check('message').escape()
], async (req, res, next) => {
    const chatSettings = await getChatSettings()
    if(chatSettings.status === "disabled") {
        res.sendStatus(200)
        return;
    }
    if(req.user.muted) {
        res.json({
            type: "muted"
        })
        return;
    }
    let userLastChatTime = req.user.lastChatTime
    if(userLastChatTime.getTime() + 5000 >= Date.now() && req.user.auth < 3) {
        const timeLeft = Math.round(((userLastChatTime.getTime() + 5000) - Date.now()) / 1000)
        res.json({
            timeLeft: timeLeft,
            type: "cooldown"
        })
        return;
    }
    req.body.message = req.body.message.replace(/(\r\n|\n|\r)/gm," ")
    if(req.body.message.length > 100 && req.user.auth < 3) {
        res.json({
            charLim: 100,
            type: "maxchar"
        })
        return;
    }
    const io = req.app.get("socketio")
    const chatData = await addChat(req.user, req.body.message)
    if(chatData === 500) return res.sendStatus(500)
    await updateLastChatTime(req.user.googleId)
    io.emit("newChatAdmin", {
        message: chatData.messageFiltered.replace(/&/g, "&amp;"),
        unfilteredMessage: chatData.message.replace(/&/g, "&amp;"),
        userName: _.startCase(req.user.firstName + " " + req.user.lastName),
        chatId: chatData.chatId,
        muted: req.user.muted
    })
    io.emit("newChat", {
        message: chatData.messageFiltered.replace(/&/g, "&amp;"),
        userName: _.startCase(req.user.firstName + " " + req.user.lastName),
        chatId: chatData.chatId
    })
    res.sendStatus(200)
})

router.get("/liveChats", async (req, res, next) => {
    const chats = await getChats(false)
    res.json(chats)
})

router.get("/slate", async (req, res, next) => {
    const slate = await getSlate()
    res.json(slate)
})

router.get("/emojis", async (req, res, next) => {
    const emojis = await getEmojis()
    res.json(emojis)
})

router.post('/errorReport', authCheck, (req, res, next) => {
    var db = req.app.get('db')
    var errorTitle;
    if(req.body.errorType == '1') {
        errorTitle = "Video is buffering excessively"
    } else if(req.body.errorType == '2') {
        errorTitle = "Video not loading"
    } else if(req.body.errorType == '3') {
        errorTitle = "Audio cutting out"
    } else if(req.body.errorType == '4') {
        errorTitle = "Video and Audio not aligned"
    } else if(req.body.errorType == '5') {
        errorTitle = "Website not working"
    } else if(req.body.errorType == '6') {
        errorTitle = "Chat not working"
    } else {
        res.sendStatsu(500)
        return;
    }
    var errorID = randomstring.generate()
    db.collection('errors').insertOne({
        "errorTitle": errorTitle,
        "errorCode": req.body.errorType,
        "errorID": errorID,
        "errorStatus": "Needs Action",
        "error_no": randomstring.generate({length: 4, charset: 'numeric'}),
        "errorMeta": {
            "user": req.user.googleId,
            "user_firstName": req.user.firstName,
            "user_lastName": req.user.lastName,
            "user_email": req.user.email,
            "timestamp": Date.now()
        },
        "errorCaptures": []
    })
    res.json({"errorID": errorID, "status": 200})
})

router.post('/errorReport/ScreenShotUpload', upload.single('image'), (req, res, next) => {
    console.log("Incoming Error Capture")
    const file = req.file
    if (!file) {
        res.sendStatus(520)
    }
        res.send(file)
})


// TV Wall API Calls

router.get('/healthcheck/slate', async (req, res, next) => {
    const slate = await getSlate()
    res.json([{"status": 200, "payload": {slate}}])
})

router.get('/healthcheck/stream', async (req, res, next) => {
    const stream = await getStream()
    res.json([{"status": 200, "payload": {stream}}])
})


module.exports = router;
