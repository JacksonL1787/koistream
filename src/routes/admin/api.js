const express = require('express');
const router = express.Router();

const _ = require("lodash")

const notification = require("./notification")
const socketTo = require("./socketTo")
const muteUser = require("../../db/users/muteUser")
const setStreamInfo = require('../../db/streamSettings/setStreamInfo')
const endPoll = require('../../db/polls/endPoll')
const startPoll = require("../../db/polls/startPoll")
const deleteChat = require("../../db/liveChats/deleteChat")
const setSlate = require("../../db/streamSettings/setSlate")
const getSlate = require("../../db/streamSettings/getSlate")
const getUsers = require("../../db/users/getUsers")
const createChatTag = require("../../db/chatTags/createChatTag")
const editChatTag = require("../../db/chatTags/editChatTag")
const getChatTags = require("../../db/chatTags/getChatTags")
const deleteChatTag = require("../../db/chatTags/deleteChatTag")
const getStreamStatus = require("../../db/streamSettings/getStreamStatus")
const getChatSettings = require("../../db/streamSettings/getChatSettings")
const setStreamStatus = require("../../db/streamSettings/setStreamStatus")
const setChatStatus = require("../../db/streamSettings/setChatStatus")
const setChatCooldown = require("../../db/streamSettings/setChatCooldown")
const clearChats = require("../../db/liveChats/clearChats")
const chatCount = require("../../db/liveChats/chatCount")
const getStreamStartTime = require("../../db/streamSettings/getStreamStartTime")
const addStreamActivity = require("../../db/streamActivity/add")
const getStreamActivity = require("../../db/streamActivity/get")
const clearStreamActivity = require("../../db/streamActivity/clear")
const getUserDetails = require("../../db/users/getUserDetails")
const setUserAuth = require("../../db/users/setUserAuth")
const getViewers = require("../../db/socketConnections/getViewers")


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

router.get("/getStreamControls", adminAuth, async (req, res, next) => {
	let data = {
		stream: await getStreamStatus(),
		slate: await getSlate(),
		chat: await getChatSettings()
	}
	data.slate = data.slate.slate
	res.json(data)
})


router.post("/updateSlateStatus", adminAuth, async (req, res, next) => {
	const io = req.app.get("socketio")
	let slateUpdate = await setSlate(req.body.status)
	if(!slateUpdate) return res.sendStatus(500);
	io.emit("slateChange")
	addStreamActivity(
		req.user.googleId, 
		req.body.status ? "Turned on the stream slate" : "Turned off the stream slate", 
		io,
		true
	)
	io.in("admin").emit("updateControls")
	if(!req.body.status) io.emit("reloadStreamSource");
	res.sendStatus(200)
})

router.post("/updateStreamStatus", adminAuth, async (req, res, next) => {
	const io = req.app.get("socketio")
	let slateUpdate = await setStreamStatus(req.body.status)
	if(!slateUpdate) return res.sendStatus(500);
	
	if(!req.body.status) {
		let clearedChats = await clearChats()
		let clearedActivity = clearStreamActivity()
	} else {
		addStreamActivity(
			req.user.googleId, 
			"Started the stream", 
			io,
			false
		)
	}
	io.emit("setStreamStatus")
	io.in("admin").emit("updateControls")
	res.sendStatus(200)
})

router.post("/updateChatStatus", adminAuth, async (req, res, next) => {
	const io = req.app.get("socketio")
	let chatStatusUpdate = await setChatStatus(req.body.status)
	if(!chatStatusUpdate) return res.sendStatus(500);
	addStreamActivity(
		req.user.googleId,
		req.body.status ? "Enabled the live chat" : "Disabled the live chat", 
		io,
		true
	)
	io.emit("updateChatStatus")
	io.in("admin").emit("updateControls")
	res.sendStatus(200)
})

router.post("/updateChatCooldown", adminAuth, async (req, res, next) => {
	const io = req.app.get("socketio")
	let chatCooldownUpdate = await setChatCooldown(req.body.status)
	if(!chatCooldownUpdate) return res.sendStatus(500);
	addStreamActivity(
		req.user.googleId,
		req.body.status ? "Turned on chat slow mode" : "Turned off chat slow mode", 
		io,
		true
	)
	io.in("admin").emit("updateControls")
	res.sendStatus(200)
})

router.post("/clearChats", adminAuth, async (req, res, next) => {
	const io = req.app.get("socketio")
	const cleared = await clearChats()
	addStreamActivity(
		req.user.googleId,
		"Cleared all the chats", 
		io,
		true
	)
	io.emit("clearChats")
	res.sendStatus(200)
})

router.post("/searchUsers", adminAuth, async (req, res, next) => {
	const users = await getUsers(req.body)
	if(users === "prompt search") return res.json("prompt search")
	res.json(users)
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
	res.sendStatus(200)
})

router.get('/getStreamActivity', adminAuth, async (req,res,next) => {
	let activity = await getStreamActivity()
	res.json(activity)
})

router.get('/getViewers', adminAuth, async (req,res,next) => {
	let viewers = await getViewers()
	res.json(viewers)
})

router.get('/chatCount', adminAuth, async (req,res,next) => {
	let count = await chatCount()
	res.json(count)
})

router.get('/streamStartTime', adminAuth, async (req,res,next) => {
	let time = await getStreamStartTime()
	res.json(time)
})

router.get('/userDetails/:googleId', adminAuth, async (req,res,next) => {
	let user = await getUserDetails(req.params.googleId)
	if(!user) return res.sendStatus(500)
	res.json(user)
})

router.get('/getChatTags', adminAuth, async (req,res,next) => {
	let tags = await getChatTags()
	res.json(tags)
})

router.post('/createChatTag', adminAuth, async (req,res,next) => {
	const io = req.app.get("socketio")
	const tag = await createChatTag(req.body);
	io.in('admin').emit("chatTagCreated", tag)
	res.sendStatus(200)
})

router.post('/editChatTag', adminAuth, async (req,res,next) => {
	const io = req.app.get("socketio")
	const tag = await editChatTag(req.body);
	if(!tag) return res.sendStatus(500)
	io.in('admin').emit("chatTagEdited", tag)
	res.sendStatus(200)
})

router.post('/deleteChatTag', adminAuth, async (req,res,next) => {
	const io = req.app.get("socketio")
	const success = await deleteChatTag(req.body.id);
	if(!success) return res.sendStatus(500)
	io.in('admin').emit("chatTagDeleted", {id: req.body.id})
	res.sendStatus(200)
})

router.post('/setUserAuth', adminAuth, async (req,res,next) => {
	if(!req.body.user) return res.sendStatus(500)
	const auth = await setUserAuth(req.body.user, req.body.admin);
	if(!auth) return res.sendStatus(500);
	const io = req.app.get("socketio")
	socketTo(io, req.body.user, "updateChatStatus", {})
	res.sendStatus(200)
})

router.post('/muteUser', adminAuth, async (req,res,next) => {
	if(!req.body.user) return res.sendStatus(500)
	const muted = await muteUser(req.body.user);
	if(!muted.success) return res.sendStatus(500);
	const io = req.app.get("socketio")
	addStreamActivity(
		req.user.googleId,
		muted.status ? "Muted a user" : "Unmuted a user", 
		io,
		true
	)
	// notification(io, `{${req.user.googleId}} deleted a chat`)
	socketTo(io, req.body.user, "updateChatStatus", {})
	io.in('admin').emit("userMuted", {user: req.body.user, muted: muted.status})
	res.sendStatus(200)
})

router.post('/deleteChat', adminAuth, async (req,res,next) => {
	if(!req.body.chatId) return res.sendStatus(500)
	const io = req.app.get("socketio")
	notification(io, `{${req.user.googleId}} deleted a chat`)
	await deleteChat(req.body.chatId)
	io.emit("deleteChat", req.body.chatId)
	res.sendStatus(200)
})

module.exports = router;
