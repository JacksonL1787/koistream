const socket = io();
let modalCallback;
let autoScroll = true;
let player;

const exitFullscreen = () => {
	if($("#koistream-video").hasClass("vjs-fullscreen")) {
		$(".vjs-fullscreen-control").click()
	}
}

const setViewerCount = () => {
	$.get({
		url: "/user/api/getViewerCount",
		success: (count) => {
			$('#viewer-number').css("--num", count)
			$(".viewer-count-label").text(count == 1 ? "Viewer" : "Viewers")
		}
	})
}

const reloadStreamSource = () => {
	if(!player) return;
	player.src(player.src())
	player.play()
	player.muted(false);
}

const setSlate = () => {
	if(!window.streamActive) return;
	$.get({
		url: "/user/api/getSlate",
		success: (data) => {
			exitFullscreen()
			if(!data.slate) return $('#stream-slate').hide();
			$('#stream-slate').show()
		}
	})
}

const setChatStatus = () => {
	if(!window.streamActive) return;
	$.get({
		url: "/user/api/getChatStatus",
		success: (data) => {
			$(".chat-state-container").hide()
			$("#chat-input").blur().val("")
			$("#chat-container .chat-input-container .emoji-menu").removeClass("active")
			$("#chat-container .chat-input-controls .emojis-menu-button.chat-input-button").removeClass("active")
			switch (data.state) {
				case "disabled":
					$(".chat-state-container.disabled-container").show()
					break;
				case "muted":
					$(".chat-state-container.muted-container").show()
					break;
			}
		}
	})
}

const setStreamInfo = () => {
	if(!window.streamActive) return;
	$.get({
		url: "/user/api/getStreamInfo",
		success: (data) => {
			$(".header-title-container .stream-title").text(data.title)
			$(".episode-description-container .description").text(data.description)
		}
	})
}

const streamOnline = () => {
	$(".header-title-container .page-title").text("Live")
	setStreamInfo()
	setChatStatus()
	setSlate()
	reloadStreamSource()
}

const streamOffline = () => {
	$(".header-title-container .page-title").text("Offline")
	$(".header-title-container .stream-title").text("KoiStream")
	$(".episode-description-container .description").text("Koistream is currently offline.")
	$('#stream-slate').show()
	$(".chat-state-container").hide()
	$(".chat-state-container.disabled-container").show()
	$("#chat-input").blur().val("")
	$("#chat-container .chat-input-container .emoji-menu").removeClass("active")
	$("#chat-container .chat-input-controls .emojis-menu-button.chat-input-button").removeClass("active")
}

const setStreamStatus = () => {
	$.get({
		url: "/user/api/getStreamStatus",
		success: (data) => {
			window.streamActive = data.active
			if(data.active) return streamOnline();
			streamOffline();
		}
	})
}

const scrollToBottom = () => {
	if(autoScroll) {
		$("#chat-container .chats-scroll-container").scrollTop($("#chat-container .chats-scroll-container")[0].scrollHeight)
	}
}

const deleteChat = (chatID) => {
	$(`#chat-container .all-chats-container #${chatID}`).remove()
}

const openModal = (elem) => {
	if(!elem.hasClass("modal-container")) return;
	elem.addClass("active");
	$("body").addClass("inactive")
	$("#modal-active-overlay").addClass("active")
}

const closeModal = () => {
	$("#modal-active-overlay, .modal-container").removeClass("active")
	$("body").removeClass("inactive")
	setTimeout(modalCallback, 300)
}

const openPoll = () => {
	$.get({
		url: "/user/api/getPoll",
		success: (data) => {
			$("#poll-modal .already-voted").hide()
			if(data.userAnswered) return $("#poll-modal .already-voted").show();
			$("body").addClass("inactive")
			$("#open-poll-button").removeClass("active")
			$("#poll-modal .question").text(data.question)
			$("#poll-modal .options-container").empty()
			data.options.forEach((o) => {
				$("#poll-modal .options-container").append(`
					<div class="option" id="${o.id}">
						<p class="value">${o.value}</p>
					</div>
				`)
			})
			$("#poll-modal, #poll-modal-overlay").addClass("active")
		}
	})
}

const closePoll = () => {
	$("body").removeClass("inactive")
	$("#open-poll-button").addClass("active")
	$("#poll-modal, #poll-modal-overlay").removeClass("active")
}

const startPoll = () => {
	closeModal()
	exitFullscreen()
	openPoll()
}

const endPoll = () => {
	closePoll()
	$("#open-poll-button").removeClass("active")
}

const appendChat = (data) => {
	let message = $('<textarea/>').html(data.message).text();
	message = `<span class="chat-text">${message}</span>`
	window.emojis.forEach((e) => {
	    let re  = new RegExp(`:${e.tag}:`,"gmi")
	    message = message.replace(re,`</span><span class="chat-emoji" data-tag="${e.tag}"><img class="chat-emoji-img" src="/img/emojis/${e.src}"></span><span class="chat-text">`)
	})
	message = message.replace(/\<span class="chat-text"\>\<\/span\>/gmi, "")
	$("#chat-container .all-chats-container").append(`
		<div class="chat" id="${data.chatId}">
			${data.tagName ? `<span class="chat-tag" style="color: ${data.tagColor}; background: ${data.tagColor}26; border-color: ${data.tagColor}; box-shadow: 0 0 3px 0 ${data.tagColor};">${data.tagName}</span>` : ""}
			<span class="chat-sender" style="color: ${data.nameColor}">${data.userName}:</span>
			${message}
		</div>
	`)
	scrollToBottom()
}

const sendMessage = () => {
	const data = {
		message: $("#chat-input").text()
	}
	if(data.message.trim().length===0) return;
	$("#chat-input").empty()
	$.post({
		url: "/user/api/sendMessage",
		data: data,
		success: (data) => {
			$("#chat-container .chat#cooldown-notification").remove()
			if(data.type && data.type === "cooldown") {
				appendChat({
					message: `Please wait ${data.timeLeft} seconds until chatting again.`,
					userName: "Cooldown",
					chatId: "cooldown-notification",
					tagName: false,
					tagColor : false,
					nameColor: "#f00"
				})
			}
		}
	})
}

const appendEmojis = () => {
	window.emojis.forEach((e) => {
		$(".emoji-menu .emojis-container").append(`
			<div class="emoji-button" data-tag="${e.tag}">
				<img class="icon" src="/img/emojis/${e.src}">
			</div>
		`)
	})
}

const setUserChatSettings = () => {
	let settings = window.userChatSettings
	settings.nameColors.sort((a,b) => {
		return a.id-b.id;
	})
	$(".choose-name-color-container .options-container, .choose-chat-tag-container .options-container").empty()
	$(".choose-chat-tag-container .no-chat-tags").hide()
	settings.nameColors.forEach((c) => {
		$(".choose-name-color-container .options-container").append(`
			<div class="name-color-option${c.active ? " selected" : ""}" style="background: ${c.color};" data-option="${c.id}">
				<div class="selected-bg">
					<img class="icon" src="/img/checkmark-icon-white.svg">
				</div>
			</div>
		`)
	})
	
	if(!settings.chatTags.length) return $(".choose-chat-tag-container .no-chat-tags").show();

	settings.chatTags.forEach((ct) => {
		$(".choose-chat-tag-container .options-container").append(`
			<div class="chat-tag-option${ct.active ? " selected" : ""}" data-option="${ct.id}">
				<img class="checkmark-icon" src="/img/checkmark-icon-white.svg">
				<span class="tag" style="color: ${ct.tagColor}; background: ${ct.tagColor}26; border-color: ${ct.tagColor}; box-shadow: 0 0 3px 0 ${ct.tagColor};">${ct.tagName}<span>
			</div>
		`)
	})


}

const appendAllChats = () => {
	window.chats.forEach((chat) => {
		chat.userName = _.startCase(chat.firstName + " " + chat.lastName)
		appendChat(chat)
	})
	$("#chat-container .chats-scroll-container").scroll(() => {
	    setTimeout(() => {
	        const elem = $("#chat-container .chats-scroll-container")
	        if(elem[0].scrollTop + elem[0].offsetHeight >= elem[0].scrollHeight - 20) {
	            autoScroll = true;
	            $("#chat-container .enable-autoscroll-button").removeClass('active')
	        } else {
	            autoScroll = false;
	            $("#chat-container .enable-autoscroll-button").addClass('active')
	        }
	    }, 200)
	})
	
	
	$("#chat-container .enable-autoscroll-button").click(function() {
	    autoScroll = true;
	    $(this).removeClass("active")
	    scrollToBottom()
	})
}

setTimeout(() => {
	$("#preload-container").addClass("done")
	$("body").removeAttr("style")
	setViewerCount()
    setTimeout(() => {
        $("#preload-container").remove()
    }, 300)
}, 1000)

$(".close-modal-button").click(closeModal)
$("#modal-active-overlay").click(closeModal)

$("#chat-container .chat-header-container .show-more-controls-button").click(() => {
	$("#chat-container").addClass("show-more-controls");
	$("#chat-container .chats-scroll-container").animate({
		scrollTop: autoScroll ? $("#chat-container .chats-scroll-container")[0].scrollHeight + 10000000 : $("#chat-container .chats-scroll-container").scrollTop() + 60
	}, 300, "linear")
})

$("#open-poll-button").click(() => {
	openPoll()
})

$("#poll-modal .close-poll-modal, #poll-modal-overlay").click(() => {
	closePoll()
})

$("#chat-container .more-controls-container .hide-more-controls-button").click(() => {
	$("#chat-container").removeClass("show-more-controls");
	if(autoScroll) return;
	$("#chat-container .chats-scroll-container").animate({
		scrollTop: $("#chat-container .chats-scroll-container").scrollTop() - 60
	}, 300, "linear")
})

$("#chat-container .more-controls-container .control-button.logout-button").click(() => {
	window.location.href="/auth/logout";
})

$("#chat-container .more-controls-container .control-button.chat-settings-button").click(() => {
	modalCallback = () => {
		$(".choose-name-color-container .name-color-option, .choose-chat-tag-container .chat-tag-option").removeClass("selected")
		window.userChatSettings.nameColors.forEach((c) => {
			if(c.active) $(`.choose-name-color-container .name-color-option[data-option="${c.id}"]`).addClass("selected")
		})
		window.userChatSettings.chatTags.forEach((ct) => {
			if(ct.active) $(`.choose-chat-tag-container .chat-tag-option[data-option="${ct.id}"]`).addClass("selected")
		})
	}
	openModal($("#chat-settings-modal"))
})

$("#chat-container .more-controls-container .control-button.report-error-button").click(() => {
	modalCallback = () => {
		$("#report-error-modal .error-type-option").removeClass("selected")
		$("#report-error-modal .error-type-option").first().addClass("selected")
		$("#report-error-modal .error-description-input").val("")
	}
	openModal($("#report-error-modal"))
})

$("#chat-container #chat-guidlines-button").click(() => {
	modalCallback = () => {
		return;
	}
	openModal($("#chat-guidelines-modal"))
})

$("#chat-container .chat-input-controls .emojis-menu-button.chat-input-button").click(() => {
	$("#chat-container .chat-input-controls .emojis-menu-button.chat-input-button").toggleClass("active")
	$("#chat-container .chat-input-container .emoji-menu").toggleClass("active")
})

$("#chat-input").focusin(() => {
	$(".chat-input-container .input-container").addClass("focus")
})

$("#chat-input").focusout(() => {
	$(".chat-input-container .input-container").removeClass("focus")
})

$("#chat-input").bind("paste", (e) => {
	e.preventDefault()
	document.execCommand('insertText', false, e.originalEvent.clipboardData.getData('text/plain'))
})

$('#chat-input').bind('dragover drop', (e) => {
    e.preventDefault();
    return false;
});

$(".chat-input-controls .send-chat-button").click(sendMessage)

$("#chat-settings-modal .update-chat-settings-button").click(() => {
	const data = {
		nameColor: $(".choose-name-color-container .name-color-option.selected").attr("data-option"),
		chatTag: $(".choose-chat-tag-container .chat-tag-option.selected").length > 0 ? $(".choose-chat-tag-container .chat-tag-option.selected").attr("data-option") : false
	}

	closeModal()

	$.post({
		url: "/user/api/setUserChatSettings",
		data: data,
		success: () => {
			window.userChatSettings.nameColors.forEach((c) => {
				c.active = false;
				if(c.id === parseInt(data.nameColor)) c.active = true;
			})
			window.userChatSettings.chatTags.forEach((ct) => {
				ct.active = false;
				if(ct.id === data.chatTag) ct.active = true;
			})
			appendChat({
				message: "Your chat settings have been changed!",
				userName: "KoiStream",
				chatId: undefined,
				tagName: "Success",
				tagColor : "#03fc0b",
				nameColor: "#03fc0b"
			})
		},
		error: () => {
			appendChat({
				message: "Failed to change your chat settings!",
				userName: "KoiStream",
				chatId: undefined,
				tagName: "Error",
				tagColor : "#f00",
				nameColor: "#f00"
			})
		}
	})

})

$("#report-error-modal .submit-error-report-button").click(() => {
	const data = {
		type: $("#report-error-modal .error-type-option.selected").attr("data-type"),
		description: $("#report-error-modal .error-description-input").val()
	}

	closeModal()

	$.post({
		url: "/user/api/submitError",
		data,
		success: () => {
			appendChat({
				message: "We got your report! We will get your problem resolved as soon as possible.",
				userName: "KoiStream",
				chatId: undefined,
				tagName: "Success",
				tagColor : "#03fc0b",
				nameColor: "#03fc0b"
			})
		},
		error: () => {
			appendChat({
				message: "Failed to submit report! If this issue persists, contact us directly at koistream@dtechhs.org",
				userName: "KoiStream",
				chatId: undefined,
				tagName: "Error",
				tagColor : "#f00",
				nameColor: "#f00"
			})
		}
	})

})

$(document).on("click", ".choose-name-color-container .name-color-option", function() {
	if($(this).hasClass("selected")) return;
	$(".choose-name-color-container .name-color-option").removeClass("selected")
	$(this).addClass("selected")
})

$(document).on("click", ".choose-chat-tag-container .chat-tag-option", function() {
	if($(this).hasClass("selected")) return $(this).removeClass("selected")
	$(".choose-chat-tag-container .chat-tag-option").removeClass("selected")
	$(this).addClass("selected")
})

$(document).on("click", ".all-chats-container .chat", function() {
	if(window.auth != 3) return;
	const data = {
		chatId: $(this).attr("id")
	}
	if(data.chatId === "undefined") return;
	$.post({
		url: "/admin/api/deleteChat",
		data
	})
})

$(document).on("click", "#report-error-modal .error-type-option", function() {
	$("#report-error-modal .error-type-option").removeClass("selected")
	$(this).addClass("selected")
})

$(document).on("click", "#poll-modal .options-container .option", function() {
	closePoll()
	$("#open-poll-button").removeClass("active")
	const data = {
		option: $(this).attr("id")
	}

	$.post({
		url: "/user/api/submitPollAnswer",
		data: data,
		success: () => {
			appendChat({
				message: "Thanks for voting!",
				userName: "KoiStream",
				chatId: undefined,
				tagName: "Success",
				tagColor : "#03fc0b",
				nameColor: "#03fc0b"
			})
		},
		error: () => {
			$("#open-poll-button").addClass("active")
			appendChat({
				message: "Failed to count your vote!",
				userName: "KoiStream",
				chatId: undefined,
				tagName: "Error",
				tagColor : "#f00",
				nameColor: "#f00"
			})
		}
	})

})

$(document).on("click", ".emoji-menu .emoji-button", function() {
	const tag = `:${$(this).attr("data-tag")}:`
	$("#chat-input").text($("#chat-input").text() + tag)
})

$(document).on("click", function(e) {
	let elem = $(e.target)
	console.log(elem)
	if(elem.hasClass("emoji-menu") || elem.parents().hasClass("emoji-menu") || !$(".emoji-menu").hasClass("active") || elem.hasClass("emojis-menu-button") || elem.parents().hasClass("emojis-menu-button")) return;
	$(".emoji-menu").removeClass("active")
	$(".emojis-menu-button").removeClass("active")
})

$(document).keydown((e) => {
	if(e.keyCode===27 && $(".modal-container").hasClass("active")) return closeModal()
	if(e.keyCode===13 && $("#chat-input").is(":focus")) {
		e.preventDefault()
		return sendMessage()
	}
})

$(document).ready(() => {
	openPoll()
	setStreamStatus()
	setInterval(setViewerCount, 15000)
	$("#chat-container .user-picture").attr("src", window.profilePicture)
	$(".stream-video-container").append('<video class="video-js" id="koistream-video" controls="controls" preload="auto" width="1920" height="1080" poster="/img/video-poster.png" autoplay><source class="vidSrc" src="https://dviuhv1vhftjw.cloudfront.net/out/v1/ffab5e1f68414aaba7309406dacfa7df/stream.m3u8" type="application/x-mpegURL"/></video>')
	setTimeout(function() {
		videojs.options.hls.overrideNative = true;
		// Player instance options
		var options = {
			html5: {
				nativeAudioTracks: false,
				nativeVideoTracks: false
			}
		};
		player = window.player = videojs('#koistream-video', options);
	
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
	
	},1000)

	$.when(
		$.get("/user/api/getEmojis", (emojis) => {
			window.emojis = emojis
		}),
	
		$.get("/user/api/chats", (chats) => {
			window.chats = chats
			
		}),

		$.get("/user/api/getUserChatSettings", (settings) => {
		    window.userChatSettings = settings
		})

	).then(() => {
		appendAllChats()
		appendEmojis()
		setUserChatSettings()
	})
})



socket.on("newChat", appendChat)
socket.on("deleteChat", deleteChat)
socket.on("startPoll", startPoll)
socket.on("endPoll", endPoll)
socket.on('slateChange', setSlate)
socket.on('setStreamStatus', setStreamStatus)
socket.on('updateStreamInfo', setStreamInfo)
socket.on('reloadStreamSource', reloadStreamSource)