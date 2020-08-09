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
    if(chatSettings.status === "disabled" || req.user.muted) {
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
    const chatData = await addChat(req.user, req.body.message)
    if(chatData === 500) return res.sendStatus(500)
    await updateLastChatTime(req.user.googleId)
    io.emit('big-announcement', 'the game will start soon');
    io.in('admin').emit("newChatAdmin", {
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

router.get("/chatStatus", async (req, res, next) => {
    let settings = await getChatSettings()
    console.log(req.user.muted)
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


module.exports = router;
