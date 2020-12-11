const express = require('express');
const router = express.Router();
const randomstring = require("randomstring")
const { check } = require('express-validator');

const _ = require("lodash");
const stripHtml = require("string-strip-html");
const logSymbols = require('log-symbols');


const addChat = require('../../db/liveChats/addChat')
const getChatSettings = require('../../db/streamSettings/getChatSettings')
const updateLastChatTime = require('../../db/users/updateLastChatTime')
const getEmojis = require('../../db/emojis/getEmojis')
const getChats = require('../../db/liveChats/getChats')
const getSlate = require('../../db/streamSettings/getSlate')
const getStreamInfo = require("../../db/streamSettings/getStreamInfo")
const getViewerCount = require("../../db/streams/getViewerCount")
const createError = require("../../db/errors/createError")
const getUserChatTag = require("../../db/users/getUserChatTag")
const getUserNameColor = require("../../db/users/getUserNameColor")
const getUserChatSettings = require("../../db/users/getUserChatSettings")
const setUserChatSettings = require("../../db/users/setUserChatSettings")
const getActivePoll = require("../../db/polls/getActivePoll")
const submitPollAnswer = require("../../db/polls/submitPollAnswer")



const AWS = require("aws-sdk");

AWS.config.update({accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, region: 'us-west-2'});

const authCheck = (req, res, next) => {
    if(req.user) {
        next()
    } else {
        res.send(404)
    }
}

router.post('/sendMessage', [
    check('message').escape()
], async (req, res, next) => {
    
    if(!req.user) return res.sendStatus(500);
    const chatSettings = await getChatSettings()
    chatSettings.cooldown = parseInt(chatSettings.cooldown) * 1000
    if((!chatSettings.active || req.user.muted) && req.user.auth <= 1) {
        res.json({
            type: "disabled"
        })
        return;
    }
    let userLastChatTime = req.user.lastChatTime
    if(userLastChatTime.getTime() + chatSettings.cooldown >= Date.now() && req.user.auth < 3) {
        const timeLeft = Math.round(((userLastChatTime.getTime() + chatSettings.cooldown) - Date.now()) / 1000)
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
    const chatTag = req.user.chatTag ? await getUserChatTag(req.user.chatTag) : false
    const nameColor = await getUserNameColor(req.user.nameColor)

    io.in('admin').emit("newChatAdmin", {
        message: chatData.messageFiltered.replace(/&/g, "&amp;"),
        unfilteredMessage: chatData.message.replace(/&/g, "&amp;"),
        userName: _.startCase(req.user.firstName + " " + req.user.lastName),
        chatId: chatData.chatId,
        muted: req.user.muted,
        tagName: chatTag.name,
        tagColor : chatTag.color,
        nameColor: nameColor
    })
    io.emit("newChat", {
        message: chatData.messageFiltered.replace(/&/g, "&amp;"),
        userName: _.startCase(req.user.firstName + " " + req.user.lastName),
        chatId: chatData.chatId,
        tagName: chatTag.name,
        tagColor : chatTag.color,
        nameColor: nameColor
    })
    res.sendStatus(200)
})

router.get("/chats", authCheck, async (req, res, next) => {
    const chatSettings = await getChatSettings()
    if(!chatSettings.active) return res.json([])
    const chats = await getChats(false)
    res.json(chats)
})

router.get("/getChatStatus", authCheck, async (req, res, next) => {
    let settings = await getChatSettings()
    res.send(req.user.muted ? "muted" : settings.status)
})

router.get("/getSlate", authCheck, async (req, res, next) => {
    const slate = await getSlate()
    res.json(slate)
})

router.get("/getPoll", authCheck, async (req, res, next) => {
    const poll = await getActivePoll(req.user.googleId)
    if(!poll) return res.sendStatus(500)
    res.json(poll)
})

router.post("/submitPollAnswer", authCheck, async (req, res, next) => {
    const answer = await submitPollAnswer(req.body.option, req.user.googleId)
    if(!answer) return res.sendStatus(500)
    res.sendStatus(200)
})

router.get("/getStreamInfo", authCheck, async (req, res, next) => {
    const info = await getStreamInfo()
    res.json(info)
})

router.get("/getUserChatSettings", authCheck, async (req, res, next) => {
    const user = req.user
    const settings = await getUserChatSettings(user.googleId, user.chatTag, user.nameColor)
    if(!settings) return res.sendStatus(500)
    res.json(settings)
})

router.get("/getViewerCount", authCheck, async (req, res, next) => {
    const count = await getViewerCount()
    res.json(count)
})

router.get("/getEmojis", authCheck, async (req, res, next) => {
    const emojis = await getEmojis()
    res.json(emojis)
})

router.post('/setUserChatSettings', authCheck, async (req, res, next) => {
    let updated = await setUserChatSettings(req.user.googleId, req.body)
    if(!updated) return res.sendStatus(500)
    res.sendStatus(200)
})

router.post('/submitError', authCheck, async (req, res, next) => {
    let errorCreated = await createError(req.body, req.user.googleId)
    res.sendStatus(errorCreated ? 200 : 500)
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
