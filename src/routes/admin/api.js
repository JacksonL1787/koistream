const express = require('express');
const router = express.Router();

const _ = require("lodash")

const notification = require("./notification")
const socketTo = require("./socketTo")
const getChats = require('../../db/liveChats/getChats')
const muteUser = require("../../db/users/muteUser")
const getChatSettings = require('../../db/chatSettings/getChatSettings')
const setChatSettings = require('../../db/chatSettings/saveChatSettings')
const setStreamInfo = require('../../db/streams/setStreamInfo')
const endPoll = require('../../db/polls/endPoll')
const getRecentPollResults = require('../../db/polls/getRecentPollResults')
const getStream = require('../../db/streams/getStream')
const startPoll = require("../../db/polls/startPoll")
const deleteChat = require("../../db/liveChats/deleteChat")
const setSlate = require("../../db/streamSettings/setSlate")


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

router.get("/recentPollResults", adminAuth, async (req, res, next) => {
    const results = await getRecentPollResults()
    if(!results) return res.sendStatus(500);
    res.json(results)
})

router.post("/startPoll", adminAuth, async (req, res, next) => {
    const poll = await startPoll()
    if(!poll) return res.sendStatus(500)
    const io = req.app.get("socketio")
    //notification(io, `{${req.user.googleId}} started a poll`)
    io.emit("startPoll")
    res.sendStatus(200)
})

router.post("/updateSlate", adminAuth, async (req, res, next) => {
    const io = req.app.get("socketio")
    let slateUpdate = await setSlate(req.body.type)
    if(!slateUpdate) return res.sendStatus(500);
    io.emit("slateChange")
    if(req.body.type === "off") io.emit("reloadStreamSource");
    res.sendStatus(200)
})

router.post("/endPoll", adminAuth, async (req, res, next) => {
    const pollData = await endPoll()
    if(!pollData) return res.sendStatus(500)
    const io = req.app.get("socketio")
    //notification(io, `{${req.user.googleId}} ended a poll`)
    io.emit("endPoll")
    res.json(pollData)
})


router.post("/muteUser", adminAuth, async (req, res, next) => {
    const googleId = req.body.googleId
    const tempMuted = req.body.tempMuted === "true" ? true : false
    if(!googleId) {
        res.sendStatus(500)
        return;
    }
    const io = req.app.get("socketio")
    const muteData = await muteUser(googleId, tempMuted)
    notification(io, `{${req.user.googleId}} ${muteData.muted ? "muted" : "unmuted"} {${muteData.googleId}}`)
    // const recieverFullName = _.startCase(user.firstName + " " + user.lastName)
    // const senderFullName = _.startCase(req.user.firstName + " " + req.user.lastName)
    // const logMsg = `${senderFullName}(${req.user.email}) ${mute ? "muted" : "unmuted"} ${recieverFullName}.(${user.email})`
    // await addLog(logMsg, "muting")
    socketTo(io, muteData.googleId, "updateChatStatus", {})
    io.emit("userMuted", muteData)
    res.sendStatus(200)
})

router.post("/setStreamInfo", adminAuth, async (req, res, next) => {
    const io = req.app.get("socketio")
    if(!req.body.title.replace(/ /gmi, "").length) return res.sendStatus(500);
    let streamTitle = await setStreamInfo(req.body)
    notification(io, `{${req.user.googleId}} changed the stream title`)
    io.emit("setStreamInfo")
    res.sendStatus(200)
})

router.post('/setChatSettings', adminAuth, async (req,res,next) => {
    const status = req.body.status
    const cooldown = req.body.cooldown
    if(status != "active" && status != "disabled") return res.sendStatus(500)
    if(cooldown != "10" && cooldown != "15" && cooldown != "30" && cooldown != "60") return res.sendStatus(500)
    const io = req.app.get("socketio")
    await setChatSettings(status, cooldown)
    notification(io, `{${req.user.googleId}} updated the chat settings`)
    io.emit("updateChatStatus")
    res.sendStatus(200)
})

router.get('/stream', adminAuth, async (req,res,next) => {
    let stream = await getStream()
    res.json(stream)
})

router.get('/chatSettings', adminAuth, async (req,res,next) => {
    let settings = await getChatSettings()
    res.json(settings)
})

router.post('/reloadStreamSource', adminAuth, async (req,res,next) => {
    const io = req.app.get("socketio")
    io.emit("reloadStreamSource")
    notification(io, `{${req.user.googleId}} reloaded the stream source for all clients`)
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

router.get("/chats", adminAuth, async (req, res, next) => {
    const chats = await getChats(true)
    res.json(chats)
})

module.exports = router;
