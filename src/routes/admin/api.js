const express = require('express');
const router = express.Router();

const _ = require("lodash")

const notification = require("./notification")
const socketTo = require("./socketTo")
const addLog = require("../../db/logs/addLog")
const getChatDetails = require('../../db/liveChats/getChatDetails')
const deleteChat = require("../../db/liveChats/deleteChat")
const getChats = require('../../db/liveChats/getChats')
const muteUser = require("../../db/users/muteUser")
const getUsers = require("../../db/users/getUsers")
const getErrors = require("../../db/errors/getErrors")
const getUserDetails = require("../../db/users/getUserDetails")
const startStream = require("../../db/streams/startStream")
const stopStream = require("../../db/streams/stopStream")
const isStreamActive = require("../../db/streams/isStreamActive")
const getActiveStream = require("../../db/streams/getActiveStream");
const updateSlate = require('../../db/slate/updateSlate');
const getChatSettings = require('../../db/chatSettings/getChatSettings')
const saveChatSettings = require('../../db/chatSettings/saveChatSettings')


const adminAuth = (req,res,next) => {
    if(req.user) {
        if(req.user.auth >= 2) {
            next();
        } else {
            res.sendStatus(401)
        }
    } else {
        res.sendStatus(401)
    }

}

router.get("/chatDetails/:chatId", adminAuth, async (req, res, next) => {
    let chatId = req.params.chatId
    const details = await getChatDetails(chatId)
    res.json(details)
})

router.get("/userDetails/:googleId", adminAuth, async (req, res, next) => {
    let googleId = req.params.googleId
    const user = await getUserDetails(googleId)
    res.json(user)
})

router.get("/isStreamActive", adminAuth, async (req, res, next) => {
    const active = await isStreamActive()
    res.json({active})
})

router.post("/muteUser", adminAuth, async (req, res, next) => {
    const googleId = req.body.googleId
    if(!googleId) {
        res.sendStatus(500)
        return;
    }
    const io = req.app.get("socketio")
    const muteData = await muteUser(googleId)
    notification(io, `{${req.user.googleId}} ${muteData.muted ? "muted" : "unmuted"} {${muteData.googleId}}`)
    console.log(muteData)
    // const recieverFullName = _.startCase(user.firstName + " " + user.lastName)
    // const senderFullName = _.startCase(req.user.firstName + " " + req.user.lastName)
    // const logMsg = `${senderFullName}(${req.user.email}) ${mute ? "muted" : "unmuted"} ${recieverFullName}.(${user.email})`
    // await addLog(logMsg, "muting")
    socketTo(io, muteData.googleId, "updateChatStatus", {})
    io.emit("userMuted", muteData)
    res.sendStatus(200)
})

router.post("/updateSlate", adminAuth, async (req, res, next) => {
    const io = req.app.get("socketio")
    let slateUpdate = await updateSlate(req.body.type)
    if(!slateUpdate) return res.sendStatus(500);
    notification(io, `{${req.user.googleId}} changed the stream slate`)
    io.emit("slateChange")
    res.sendStatus(200)
})

router.post('/deleteChat', adminAuth, async (req,res,next) => {
    if(!req.body.chatId) {
        res.sendStatus(500)
        return;
    }
    const io = req.app.get("socketio")
    notification(io, `{${req.user.googleId}} deleted a chat`)
    await deleteChat(req.body.chatId)
    io.emit("deleteChat", req.body.chatId)
    res.sendStatus(200)
})

router.post('/startStream', adminAuth, async (req,res,next) => {
    // return if there is an active stream
    if(!req.body.title.trim().length || !req.body.runner.trim().length) {
        return res.sendStatus(500)
    }
    const io = req.app.get("socketio")
    const stream = await startStream(req.body, req.user.googleId)
    notification(io, `{${req.user.googleId}} started a stream`)
    // add log for stream activity
    // socket emit to push users from stream down page to stream page
    io.in('admin').emit("loadCurrentStreamData")
    res.sendStatus(200)
})

router.post('/stopStream', adminAuth, async (req,res,next) => {
    // return if there is no active streams
    const io = req.app.get("socketio")
    await stopStream()
    notification(io, `{${req.user.googleId}} stopped the stream`)
    // add log for stream activity
    // socket emit to push users from stream page to stream down page
    io.in('admin').emit("loadCurrentStreamData")
    io.emit("slateChange")
    res.sendStatus(200)
})

router.post('/saveChatSettings', adminAuth, async (req,res,next) => {
    const status = req.body.status
    if(status != "active" && status != "disabled") return res.sendStatus(500)
    const io = req.app.get("socketio")
    await saveChatSettings(status)
    notification(io, `{${req.user.googleId}} updated the chat settings`)
    io.emit("updateChatStatus")
    res.sendStatus(200)
})

router.get('/activeStream', adminAuth, async (req,res,next) => {
    let stream = await getActiveStream()
    res.json(stream)
})

router.get('/chatSettings', adminAuth, async (req,res,next) => {
    let settings = await getChatSettings()
    res.json(settings)
})

router.post('/getUsers', adminAuth, async (req,res,next) => {
    req.body.muted = req.body.muted === 'true' ? true : false
    req.body.banned = req.body.banned === 'true' ? true : false
    if(!req.body.banned && !req.body.muted && req.body.search.trim().length === 0) {
        res.json([])
        return;
    }
    const users = await getUsers(req.body);
    res.json(users);
})

router.post('/getErrors', adminAuth, async (req,res,next) => {
    const errors = await getErrors();
    res.json(errors);
})

router.post('/reloadStreamSource', adminAuth, async (req,res,next) => {
    const io = req.app.get("socketio")
    io.emit("reloadStreamSource")
    notification(io, `{${req.user.googleId}} reloaded the stream source for all clients`)
    res.sendStatus(200)
})

router.get("/liveChats", adminAuth, async (req, res, next) => {
    const chats = await getChats(true)
    res.json(chats)
})

module.exports = router;
