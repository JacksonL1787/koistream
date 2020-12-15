const express = require('express');
const router = express.Router();

const _ = require("lodash")

const notification = require("./notification")
const socketTo = require("./socketTo")
const getChats = require('../../db/liveChats/getChats')
const muteUser = require("../../db/users/muteUser")
const getChatSettings = require('../../db/chatSettings/getChatSettings')
const setChatSettings = require('../../db/chatSettings/saveChatSettings')
const setStreamInfo = require('../../db/streamSettings/setStreamInfo')
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

router.post("/updateSlate", adminAuth, async (req, res, next) => {
    const io = req.app.get("socketio")
    let slateUpdate = await setSlate(req.body.type)
    if(!slateUpdate) return res.sendStatus(500);
    io.emit("slateChange")
    if(req.body.type === "off") io.emit("reloadStreamSource");
    res.sendStatus(200)
})

router.post("/updateStreamInfo", adminAuth, async (req, res, next) => {
    const io = req.app.get("socketio")
    let info = await setStreamInfo(req.body)
    if(!info) return res.sendStatus(500);
    io.emit("updateStreamInfo")
    res.sendStatus(200)
})

router.post("/startPoll", adminAuth, async (req, res, next) => {
    const poll = await startPoll(req.body.templateId)
    if(!poll) return res.sendStatus(500)
    const io = req.app.get("socketio")
    //notification(io, `{${req.user.googleId}} started a poll`)
    io.emit("startPoll")
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

module.exports = router;
