const express = require('express');
const router = express.Router();

const _ = require("lodash")

const banUser = require('../db/users/banUser')
const unbanUser = require('../db/users/unbanUser')
const getSocketId = require('../db/stream/getSocketId')
const getAllParticipants = require('../db/stream/getAllParticipants')
const getUserByGoogleId = require('../db/users/getUserByGoogleId')



const filterUsers = require("../db/users/filterUsers")


const addLog = require("../../db/logs/addLog")
const getChatDetails = require('../../db/liveChats/getChatDetails')
const deleteChat = require("../../db/liveChats/deleteChat")
const getChats = require('../../db/liveChats/getChats')
const muteUser = require("../../db/users/muteUser")
const getUsers = require("../../db/users/getUsers")
const getUserDetails = require("../../db/users/getUserDetails")
const startStream = require("../../db/streams/startStream")
const stopStream = require("../../db/streams/stopStream")
const isStreamActive = require("../../db/streams/isStreamActive")

const adminAuth = (req,res,next) => {
    if(req.user) {
        if(req.user.auth >= 2) {
            next();
        } else {
            res.redirect('/auth/redirect')
        }
    } else {
        res.redirect('/')
    }

}

router.post("/userAuth", adminAuth, (req, res, next) => {
    const db = req.app.get("db")
    const socket = req.app.get("socketio")
    db.collection('users').updateOne({'googleId': req.body.googleId}, {$set: {
        auth: parseInt(req.body.auth)
    }})
    res.sendStatus(200)
})

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
    //const socketId = await getSocketId(db, googleId)
    const muteData = await muteUser(googleId)
    console.log(muteData)
    // const recieverFullName = _.startCase(user.firstName + " " + user.lastName)
    // const senderFullName = _.startCase(req.user.firstName + " " + req.user.lastName)
    // const logMsg = `${senderFullName}(${req.user.email}) ${mute ? "muted" : "unmuted"} ${recieverFullName}.(${user.email})`
    // await addLog(logMsg, "muting")
    // if(socketId) {
    //     io.to(socketId).emit('muteUser', mute);
    // }
    io.emit("userMuted", muteData)
    res.sendStatus(200)
})

router.post('/deleteChat', adminAuth, async (req,res,next) => {
    if(!req.body.chatId) {
        res.sendStatus(500)
        return;
    }
    const io = req.app.get("socketio")
    await deleteChat(req.body.chatId)
    io.emit("deleteChat", req.body.chatId)
    res.sendStatus(200)
})

router.post('/startStream', adminAuth, async (req,res,next) => {
    // return if there is an active stream
    if(!req.body.title.trim().length || !req.body.runner.trim().length) {
        return res.sendStatus(500)
    }
    const stream = await startStream(req.body, req.user.googleId)
    // add log for stream activity
    // socket emit to push users from stream down page to stream page
    // Socket emit to everyone on current stream page to load started stream
    
    res.sendStatus(200)
})

router.post('/stopStream', adminAuth, async (req,res,next) => {
    // return if there is no active streams
    await stopStream()
    // add log for stream activity
    // socket emit to push users from stream page to stream down page
    // Socket emit to everyone on current stream page to load stopped stream
    res.sendStatus(200)
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



router.get("/liveChats", adminAuth, async (req, res, next) => {
    const chats = await getChats(true)
    res.json(chats)
})

router.post('/endStream', adminAuth, (req,res,next) => {
    const db = req.app.get("db")
    const socket = req.app.get("socketio")
    async function getData() {
        var streamState = await db.collection('siteControls').find({"identifier": "streamState"}).toArray()
        if(streamState[0].state) {
            db.collection('siteControls').updateOne({"identifier": "streamState"}, {$set: {
                "state": false,
                "associatedStream": 0
            }})
            db.collection('siteControls').updateOne({"identifier": "currentStream"}, {$set: {
                streamId: 0,
                liveStream: false,
                streamName: "Pending",
                streamRunner: "Pending",
                liveChats: [],
                participants: [],
                participantLogs: []
            }})
            res.sendStatus(200)
            setTimeout(function(){
                socket.emit('reloadSiteClients');
            }, 1000)
        } else {
            res.sendStatus(500)
        }
    } 
    getData()
})

router.get('/getParticipants', adminAuth, async (req,res,next) => {
    const db = req.app.get("db");
    const allParticipants = await getAllParticipants(db);
    res.json(allParticipants);
})

router.post('/filterUsers', adminAuth, async (req,res,next) => {
    const db = req.app.get("db");
    const users = await filterUsers(db, req.body);
    res.json(users);
})

router.post('/resetViewers', adminAuth, async (req,res,next) => {
    const db = req.app.get("db");
    const io = req.app.get("socketio")
    await db.collection("streams").update({}, {$set: {participants: []}})
    io.emit("reloadStreamClients")
    res.sendStatus(200)
})

router.post('/banUser', adminAuth, async (req,res,next) => {
    const db = req.app.get("db")
    const io = req.app.get("socketio")
    const googleId = req.body.googleId
    const socketId = await getSocketId(db, googleId)
    const user = await getUserByGoogleId(db, googleId)
    const recieverFullName = _.startCase(user.firstName + " " + user.lastName)
    const senderFullName = _.startCase(req.user.firstName + " " + req.user.lastName)
    const logMsg = `${senderFullName}(${req.user.email}) banned ${recieverFullName}.(${user.email})`
    addLog(logMsg, "bans")
    banUser(db, googleId)
    if(socketId) {
        io.to(socketId).emit('reloadSiteClients');
    }
    res.sendStatus(200)
})

router.post('/unbanUser', adminAuth, async (req,res,next) => {
    const db = req.app.get("db")
    const io = req.app.get("socketio")
    const googleId = req.body.googleId
    const user = await getUserByGoogleId(db, googleId)
    const recieverFullName = _.startCase(user.firstName + " " + user.lastName)
    const senderFullName = _.startCase(req.user.firstName + " " + req.user.lastName)
    const logMsg = `${senderFullName}(${req.user.email}) unbanned ${recieverFullName}.(${user.email})`
    addLog(logMsg, "bans")
    unbanUser(db, googleId)
    io.emit("reloadUnban", googleId)
    res.sendStatus(200)
})

router.post('/slateControl', adminAuth, (req, res, next) => {
    if(req.user && req.user.auth >= 2) {
        const db = req.app.get("db")
        let slateType = 1;
        console.log(req.body)
        console.log(req.body)
        if(req.body.selection == "Bars and Tones") {
            slateType = 1
        }
        if(req.body.selection == "Splash") {
            slateType = 2
        }
        if(req.body.selection == "Maintainance") {
            slateType = 3
        }
        async function run() {
            db.collection("siteControls").updateOne({"identifier": "slate"}, {$set: {
                state: (req.body.state == 'true'),
                slateType
            }})
            res.json("Success")
        } run()
    }
})

module.exports = router;
