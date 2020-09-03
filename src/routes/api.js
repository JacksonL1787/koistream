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
const getActiveSlate = require('../db/slate/getActiveSlate')
const getActiveStream = require("../db/streams/getActiveStream")
const getStreamInfo = require("../db/streams/getStreamInfo")
const getViewerCount = require("../db/streams/getViewerCount")
const createError = require("../db/errors/createError")
const isStreamActive = require("../db/streams/isStreamActive")
const stripHtml = require("string-strip-html");


const logSymbols = require('log-symbols');

const AWS = require("aws-sdk");

AWS.config.update({accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, region: 'us-west-2'});

const authCheck = (req, res, next) => {
    if(req.user) {
        if(req.user.auth > 0) {
            next()
        }
    } else {
        res.send(404)
    }
}

router.post('/sendMessage', [
    check('message').escape()
], async (req, res, next) => {
    
    const chatSettings = await getChatSettings()
    if((chatSettings.status === "disabled" || req.user.muted) && req.user.auth <= 1) {
        res.json({
            type: "disabled"
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
    req.body.message = stripHtml(req.body.message).result
    const chatData = await addChat(req.user, req.body.message)
    if(chatData === 500) return res.sendStatus(500)
    await updateLastChatTime(req.user.googleId)
    io.emit('big-announcement', 'the game will start soon');
    io.in('admin').emit("newChatAdmin", {
        message: chatData.messageFiltered.replace(/&/g, "&amp;"),
        unfilteredMessage: chatData.message.replace(/&/g, "&amp;"),
        userName: _.startCase(req.user.firstName + " " + req.user.lastName),
        chatId: chatData.chatId,
        muted: req.user.muted,
        chatTag: req.user.chatTag
    })
    io.emit("newChat", {
        message: chatData.messageFiltered.replace(/&/g, "&amp;"),
        userName: _.startCase(req.user.firstName + " " + req.user.lastName),
        chatId: chatData.chatId,
        chatTag: req.user.chatTag
    })
    res.sendStatus(200)
})

router.get("/liveChats", async (req, res, next) => {
    const chatSettings = await getChatSettings()
    if(chatSettings.status === "disabled") return res.json([])
    const chats = await getChats(false)
    res.json(chats)
})

router.get("/chatStatus", async (req, res, next) => {
    let settings = await getChatSettings()
    res.send(req.user.muted ? "muted" : settings.status)
})

router.get("/getActiveSlate", async (req, res, next) => {
    const slate = await getActiveSlate()
    res.json(slate)
})

router.get("/getStreamInfo", async (req, res, next) => {
    const info = await getStreamInfo()
    res.json(info)
})

router.get("/getViewerCount", async (req, res, next) => {
    const count = await getViewerCount()
    res.json(count)
})

router.get("/emojis", async (req, res, next) => {
    const emojis = await getEmojis()
    res.json(emojis)
})

router.post('/submitError', authCheck, async (req, res, next) => {
    let errorCreated = await createError(req.body, req.user.googleId)
    res.sendStatus(errorCreated ? 200 : 500)
})


// TV Wall API Calls

router.get('/healthcheck/slate', async (req, res, next) => {
    const slate = await getSlate()
    res.json([{"status": 200, "payload": {slate}}])
})

router.get('/healthcheck/stream', async (req, res, next) => {
    const stream = await getActiveStream()
    res.json([{"status": 200, "payload": {stream}}])
})

// StreamServer

router.post('/changeStreamServer', authCheck, async (req, res, next) => {
    var medialive = new AWS.MediaLive();

    var params = {
        ChannelId: '8850790' /* required */
    };

    if(req.body.state == "true") {
        medialive.startChannel(params, function(err, data) {
            if(err) {
                console.log(err, err.stack);
            }
            else {
                console.log(logSymbols.success + " An administrator has changed the StreamServer state to: " + data.State);
                res.json({"status": 200, "payload": {"serverState": data.State, "ServerName": data.Name, " EgressEndpoints": data.EgressEndpoints}})
            }
        });  
    } else {
        medialive.stopChannel(params, function(err, data) {
            if(err) {
                console.log(err, err.stack);
            }
            else {
                console.log(logSymbols.success + " An administrator has changed the StreamServer state to: " + data.State);
                res.json({"status": 200, "payload": {"serverState": data.State, "ServerName": data.Name, "EgressEndpoints": data.EgressEndpoints}})
            }
        });  
    }
})

router.post('/getStreamServerInputs', authCheck, async (req, res, next) => {
    var medialive = new AWS.MediaLive();

    var params = {
        
    };

    medialive.listInputs(params, function(err, data) {
        if(err) {
            console.log(err, err.stack);
        }
        else {
            res.json({"status": 200, "payload": data.Inputs[0].Destinations})
            console.log(logSymbols.success + " An administrator has called the StreamServer Inputs");
        }
    });  
})

router.post('/getStreamServerState', authCheck, async (req, res, next) => {
    var medialive = new AWS.MediaLive();

    var params = {
        ChannelId: '8850790' /* required */
    };

    medialive.describeChannel(params, function(err, data) {
        if(err) {
            console.log(err, err.stack);
        }
        else {
            res.json({"status": 200, "payload": {"ServerState":data.State}})
            console.log(logSymbols.success + " An administrator has called the StreamServer Channel Description");
        }
    });
})



module.exports = router;
