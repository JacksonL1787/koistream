let timerInterval = setInterval(()=>{}, 1000)
let dataCountsInterval = setInterval(() =>{},1000)

const setStreamInfo = () => {
	$.get({
		url: "/user/api/getStreamInfo",
		success: (data) => {
			$(".stream-title-input").val(data.title)
			$(".stream-description-input").val(data.description)
		}
	})
}

const appendActivity = (data) => {
	$("#stream-activity-widget .activity-content").prepend(`

		<div class="activity-log"><img class="profile-picture" src="${data.googleProfilePicture}" />
			<div class="info-container">
				<a class="user-name" href="/admin/inspect/user/${data.user}" target="_blank">${_.startCase(data.firstName + " " + data.lastName)}</a>
				<p class="message">${data.message}</p>
			</div>
			<p class="timestamp">${moment(new Date(data.timestamp)).format("LT")}</p>
		</div>
		<div class="divider">
			<div class="line"></div>
		</div>
	`)

	$("#stream-activity-widget .activity-container").scrollTop(0)
}

const setControls = () => {
	$.get({
		url: "/admin/api/getStreamControls",
		success: (data) => {
			if(data.stream) {
				$("#stream-switch-control .switch-wrap").addClass("active").find(".status").text("ON")
			} else {
				$("#stream-switch-control .switch-wrap").removeClass("active").find(".status").text("OFF")
			}

			if(data.slate) {
				$("#slate-switch-control .switch-wrap").addClass("active").find(".status").text("ON")
			} else {
				$("#slate-switch-control .switch-wrap").removeClass("active").find(".status").text("OFF")
			}
			if(data.chat.active) {
				$("#chat-switch-control .switch-wrap").addClass("active").find(".status").text("ON")
			} else {
				$("#chat-switch-control .switch-wrap").removeClass("active").find(".status").text("OFF")
			}

			if(data.chat.cooldown > 10) {
				$("#slow-mode-switch-control .switch-wrap").addClass("active").find(".status").text("ON")
			} else {
				$("#slow-mode-switch-control .switch-wrap").removeClass("active").find(".status").text("OFF")
			}

			
		}
	})
}

const setDataCounts = () => {
	$.get({
		url: "/user/api/getViewerCount",
		success: (count) => {
			$(".dynamic-viewer-count-data").text(count)
		}
	})

	$.get({
		url: "/admin/api/chatCount",
		success: (count) => {
			$(".dynamic-chat-count-data").text(count)
		}
	})
}

const setStreamTimer = (startTime) => {
	let d = Math.floor((Date.now() - startTime) / (1000 * 3600 * 24)) + "",
		h = new Date(Date.now() - startTime).getUTCHours() + "",
		m = new Date(Date.now() - startTime).getUTCMinutes() + "",
		s = new Date(Date.now() - startTime).getUTCSeconds() + "",
		timeString = ""

	timeString += (d.length == 2 ? d : "0" + d) + ":"
	timeString += (h.length == 2 ? h : "0" + h) + ":"
	timeString += (m.length == 2 ? m : "0" + m) + ":"
	timeString += s.length == 2 ? s : "0" + s

	$(".dynamic-run-time-data").text(timeString)

}

const getStreamStatus = () => {
	$.get({
		url: "/user/api/getStreamStatus",
		success: (data) => {
			if(data.active) return streamActive()
			streamInactive()
		}
	})
}

const streamActive = () => {
	$.get({
		url: "/admin/api/streamStartTime",
		success: (time) => {
			time = new Date(time)
			$("#run-time-data-container p").html(`Stream has been active for <b class="dynamic-run-time-data">00:00:00:00</b>`)
			setStreamTimer(time)
			timerInterval = setInterval(() => {
				setStreamTimer(time)
			}, 1000)
		}
	})

	$.get({
		url: "/admin/api/getStreamActivity",
		success: (data) => {
			$("#stream-activity-widget .stream-offline-message").removeClass("active")
			data.forEach(appendActivity)
		}
	})

	$("#viewer-data-container .show-all-viewers-button").show()
	$("#viewer-data-container .data-value").html('<b class="dynamic-viewer-count-data"></b> Viewers')
	$("#chat-count-data-container .data-value").html('<b class="dynamic-chat-count-data"></b> Live chats')
	setDataCounts()
	setInterval(setDataCounts, 5000)	
}

const streamInactive = () => {
	closeModal()
	clearInterval(timerInterval)
	$(".data-container .data-value").html(`Stream Inactive`)
	$("#stream-activity-widget .stream-offline-message").addClass("active")
	$("#stream-activity-widget .activity-content").empty()
	$("#viewer-data-container .show-all-viewers-button").hide()
}

const setViewerData = () => {
	$.get({
		url: "/admin/api/getViewers",
		success: (viewers) => {
			console.log(viewers)
			$("#viewers-modal .viewers-container").empty()
			if(viewers.length == 0) {
				$("#viewers-modal .no-viewers").addClass("active")
			} else {
				$("#viewers-modal .no-viewers").removeClass("active")
			}
			
			viewers.forEach((v) => {
				v.name = _.startCase(v.firstName + " " + v.lastName)
				$("#viewers-modal .viewers-container").append(`
					<a class="viewer active" data-first-name="${v.firstName}" data-last-name="${v.lastName}" data-email="${v.email}" href="/admin/inspect/user/${v.googleId}" target="_blank">
						<p class="user-name">${v.name}</p>
						<p class="user-email">${v.email}</p>
						<img class="go-to-icon" src="/img/back-icon-blue.svg">
					</a>

				`)
			})
		}
	})
}

const searchViewers = () => {
	let val = $("#viewers-modal #viewer-search-input").val().toLowerCase()
	$("#viewers-modal .viewer").removeClass("no-bottom-border")
	if(val.trim().length == 0) {
		$("#viewers-modal .viewers-container .viewer").addClass("active")
		$("#viewers-modal .no-results").removeClass("active")
	}
	$("#viewers-modal .viewer").each(function() {
		if($(this).attr("data-first-name").startsWith(val) || $(this).attr("data-last-name").startsWith(val) || ($(this).attr("data-first-name") + " " + $(this).attr("data-last-name")).startsWith(val) || $(this).attr("data-email").startsWith(val)) {
			$(this).addClass("active")
		} else {
			$(this).removeClass("active")
		}
	})
	
	if($("#viewers-modal .viewer.active").length == 0) {
		$("#viewers-modal .no-results").addClass("active")
	} else {
		$("#viewers-modal .viewer.active").last().addClass("no-bottom-border")
		$("#viewers-modal .no-results").removeClass("active")
	}
}

$("#viewers-modal #viewer-search-input").on("input", () => {
	if($("#viewers-modal .viewers-container .viewer").length == 0) return;
	searchViewers()
})

$("#viewers-modal .refresh-button").click(() => {
	$("#viewers-modal .refresh-button").addClass("rotate")
	setTimeout(() => {
		$("#viewers-modal .refresh-button").removeClass("rotate")
	}, 300)
	$("#viewers-modal #viewer-search-input").val("")
	$("#viewers-modal .viewers-container .viewer").addClass("active")
	$("#viewers-modal .no-results").removeClass("active")
	setViewerData()
})

$(".switch-control .switch-wrap").click(function() {
	let url = $(this).parent().attr("data-post-url")
	let status = !$(this).hasClass("active")
	$.post({
		url: url,
		headers: {
			"Content-Type": "application/json"
		},
		data: JSON.stringify({status})
	})
})

$("#clear-chats-button").click(() => {
	$.post({
		url: "/admin/api/clearChats"
	})
})

$("#reload-source-button").click(() => {
	$.post({
		url: "/admin/api/reloadStreamSource"
	})
})

$(".update-stream-information-button").click(() => {
	$.post({
        url: "/admin/api/updateStreamInfo",
        data: {
			title : $(".stream-title-input").val(),
			description: $(".stream-description-input").val()
		}
    })
})

$(".show-all-viewers-button").click(() => {
	setViewerData()
	openModal($("#viewers-modal"))
	modalCallback = () => {
		$("#viewers-modal #viewer-search-input").val("")
		$("#viewers-modal .viewers-container .viewer").addClass("active")
		$("#viewers-modal .no-results").removeClass("active")
	};
})

$(document).ready(() => {
    $(".video-preview-container .ratio-container").append('<video class="video-js" id="stream-video" controls="controls" preload="auto" width="1920" height="1080" poster="/img/koistream-videojs-bg.png" autoplay><source class="vidSrc" src="https://dviuhv1vhftjw.cloudfront.net/out/v1/ffab5e1f68414aaba7309406dacfa7df/stream.m3u8" type="application/x-mpegURL"/></video>')
	setControls()
	setStreamInfo()
	getStreamStatus()	
	setTimeout(function() {
		videojs.options.hls.overrideNative = true;
		// Player instance options
		var options = {
			html5: {
				nativeAudioTracks: false,
				nativeVideoTracks: false
			}
		};
		let player = window.player = videojs('#stream-video', options);
	
		let qualityLevels = player.qualityLevels();
		let videoPlay = player.play();
		let videoMute = player.muted();
	
		player.hlsQualitySelector();
		
		if(videoPlay !== undefined) {
			videoPlay.then(_ => {
				player.play();
				player.muted(false);
			}).catch(error => {
				player.play();
				player.muted(false);
			})
		}
	
	},500)
})

socket.on("updateStreamInfo", setStreamInfo)
socket.on("setStreamStatus", getStreamStatus)
socket.on("updateControls", setControls)
socket.on("newStreamActivity", appendActivity)