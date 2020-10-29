let updateTimer;
let player;

$(".radio-button").click(function() {
	$(this).toggleClass("active")
})

const loading = (state) => {
	if(state) {
		$(".page-title-flex-container, .stream-inactive-container, .stream-active-container, .start-stream-form").addClass("hidden")
		$(".start-stream-form").addClass("fade-hidden")
		$('.loader').show()
	} else {
		$(".page-title-flex-container").removeClass("hidden")
		$('.loader').hide()
	}
}


const setViewerCount = () => {
	$.get({
		url: "/api/getViewerCount",
		success: (count) => {
			$(".viewer-count p").text(`${count} ${count == 1 ? "Viewer" : "Viewers"}`)
		}
	})
}

const setSlateControlHeight = () => {
	if($(".stream-view-widget").height()) {
		const h = $(".stream-view-widget").height()
		$(".slate-control-widget").height(h)
	}
}

$(window).on("resize", setSlateControlHeight)
$(document).ready(setSlateControlHeight)

const setSlate = () => {
	$.get({
		url: "/api/getActiveSlate",
		success: (data) => {
			console.log(data)
			if(!data.active) {
				$(".slate-control-widget .active-slate-btn").removeClass("active")
				$(".slate-control-widget .slate-select").hide()
				$(".slate-control-widget .slate-inactive").show()
				return $('.stream-video .slate').hide();
			}			
			if(!$(".change-slate-preview-btn").hasClass("active"))$('.stream-video .slate').show()
			$('.stream-video .slate').css("background-image", `url(/img/slates/${data.src})`)
			if($(".slate-control-widget .slate-select .slate-option").length <= 1) return;
			$(".slate-control-widget .active-slate-btn").addClass("active")
			$(".slate-control-widget .slate-select").show()
			$(".slate-control-widget .slate-inactive").hide()
			$(".slate-control-widget .slate-select .slate-option").removeClass("active")
			$(`.slate-control-widget .slate-select .slate-option[data-type="${data.active ? data.type : "off"}"]`).addClass("active")
		}
	})
}

const setActiveStream = (data) => {
	$(".stream-inactive-container").removeClass("fade-hidden")
	data.startTime = new Date(data.startTime)
	if(updateTimer) clearTimeout(updateTimer)
	const setStreamTimer = () => {
		let d = Math.floor((Date.now() - data.startTime) / (1000 * 3600 * 24)) + "",
			h = new Date(Date.now() - data.startTime).getUTCHours() + "",
			m = new Date(Date.now() - data.startTime).getUTCMinutes() + "",
			s = new Date(Date.now() - data.startTime).getUTCSeconds() + ""
		$(".stream-timer .time-val.days").text(h.length == 2 ? d : "0" + d)
		$(".stream-timer .time-val.hours").text(h.length == 2 ? h : "0" + h)
		$(".stream-timer .time-val.minutes").text(m.length == 2 ? m : "0" + m)
		$(".stream-timer .time-val.seconds").text(s.length == 2 ? s : "0" + s)
	}
	setStreamTimer()
	updateTimer = setInterval(setStreamTimer, 1000)
	$(".stream-active-container").removeClass("hidden")
	$(".stream-view-widget .stream-title").text(data.title)
	$(".stream-view-widget .stream-video video, .slate-control-widget .slate-select .slate-option:not(.off-slate)").remove()
	if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)) {
		console.log('mobile device loading')
		$(".stream-view-widget .stream-video").append('<video class="video-js" id="my-video" controls="controls" preload="auto" width="1920" height="1080" poster="/img/countdown-bg.png"><source class="vidSrc" src="https://dviuhv1vhftjw.cloudfront.net/out/v1/ffab5e1f68414aaba7309406dacfa7df/stream.m3u8" type="application/x-mpegURL"/></video>')
	} else {
		$(".stream-view-widget .stream-video").append('<video class="video-js" id="my-video" controls="controls" preload="auto" width="1920" height="1080" poster="/img/countdown-bg.png"><source class="vidSrc" src="https://dviuhv1vhftjw.cloudfront.net/out/v1/ffab5e1f68414aaba7309406dacfa7df/stream.m3u8" type="application/x-mpegURL"/></video>')
	}
	setTimeout(function(){
		videojs.options.hls.overrideNative = true;
		// Player instance options
		var options = {
			html5: {
				nativeAudioTracks: false,
				nativeVideoTracks: false
			}
		};
		player = window.player = videojs('#my-video', options);
	
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
	setViewerCount()
	setInterval(setViewerCount, 20000)
	$(".started-by .user").attr("href", `/admin/u/${data.googleId}`)
	$(".started-by .user").text(_.startCase(data.firstName + " " + data.lastName))
	data.slates.forEach((s) => {
		$(".slate-control-widget .slate-select").append(`
			<div class="slate-option ${s.active ? "active" : ""}" data-type="${s.type}">
				<img src="/img/slates/${s.src}" />
				<div class="hover-bg">
					<div class="icon"></div>
				</div>
			</div>
		`)
	})
	if($(".slate-control-widget .slate-select .slate-option.active").length === 1) {
		$(".slate-control-widget .active-slate-btn").addClass("active")
		$(".slate-control-widget .slate-select").show()
		$(".slate-control-widget .slate-inactive").hide()
	} else {
		$(".slate-control-widget .active-slate-btn").removeClass("active")
		$(".slate-control-widget .slate-select").hide()
		$(".slate-control-widget .slate-inactive").show()
	}
	setSlateControlHeight()
}

const setInactiveStream = () => {
	$(".stream-inactive-container").removeClass("hidden")
}

const setStreamStatus = (active) => {
	$(".status-tag").removeClass("inactive").removeClass("live")
	$(".status-tag").addClass(active ? "live" : "inactive")
	$(".status-tag").text(active ? "LIVE" : "INACTIVE")
	if(active) {
		$.get({
			url: "/admin/api/activeStream",
			success: (data) => {
				setActiveStream(data)
				loading(false)
			}
		})
	} else {
		setInactiveStream()
		loading(false)
	}
	
	
}

const loadPage = () => {
	closeModal("modal")
	loading(true)
	$.get({
		url: "/admin/api/isStreamActive",
		success: (data) => {
			setStreamStatus(data.active)
		}
	})   
}

$(document).on("click", ".slate-control-widget .slate-select .slate-option", function() {
	if($(this).hasClass("active")) return;
	$(".slate-control-widget .slate-select .slate-option").removeClass("active")
	$(this).addClass("active")
	const type = $(this).attr("data-type")
	$.post({
		url: "/admin/api/updateSlate",
		data: {type}
	})
})

$(".slate-control-widget .active-slate-btn").click(() => {
	if($(".slate-control-widget .active-slate-btn").hasClass("active")) { // SHOW SLATE
		$(".slate-control-widget .active-slate-btn").addClass("active")
		$(".slate-control-widget .slate-select").show()
		$(".slate-control-widget .slate-inactive").hide()
		$.post({
			url: "/admin/api/updateSlate",
			data: {type: 1}
		})
	} else { // HIDE SLATE
		$(".slate-control-widget .active-slate-btn").removeClass("active")
		$(".slate-control-widget .slate-select").hide()
		$(".slate-control-widget .slate-inactive").show()
		$.post({
			url: "/admin/api/updateSlate",
			data: {type: "off"}
		})
	}
})

$(".change-slate-preview-btn").click(() => {
	if($(".change-slate-preview-btn").hasClass("active")) {
		$(".change-slate-preview-btn").removeClass("active")
		$(".change-slate-preview-btn p").text("Preview Without Slate")
		$(".stream-video .slate").show()
	} else {
		$(".change-slate-preview-btn").addClass("active")
		$(".change-slate-preview-btn p").text("Preview With Slate")
		$(".stream-video .slate").hide()
		if(!player) return;
		player.src(player.src())
		player.play()
		player.muted(false);
	}
	
})

$(".start-stream-form .confirm-start-btn").click(() => {

    const data = {
        title: $(".start-stream-form .title-input").val(),
        emails: $(".start-stream-form .send-notification-btn").hasClass("active")
    }

    if(data.title.trim().length <= 0) {
        return $(".start-stream-form .input-container").addClass("error");
	}
	
	$(".start-stream-form input").val("")
	$(".start-stream-form .input-container").removeClass("active")
	$(".start-stream-form .action-container").removeClass("active")
	$(".start-stream-form .send-notification-btn").removeClass("active")

    $.post({
        url: "/admin/api/startStream",
        data: data
    })
})

$(".stop-stream-btn").click(() => {
	if(!$(".stop-stream-btn").hasClass("confirm")) {
		$(".stop-stream-btn").addClass("confirm")
		$(".stop-stream-btn p").text("Confirm")
		$(".cancel-stop-stream-btn").show()
	} else {
		$(".stop-stream-btn").removeClass("confirm")
		$(".stop-stream-btn p").text("Stop Stream")
		$(".cancel-stop-stream-btn").hide()
		$.post({
			url: "/admin/api/stopStream"
		})
	}  
})

$(".cancel-stop-stream-btn").click(() => {
	$(".stop-stream-btn").removeClass("confirm")
	$(".stop-stream-btn p").text("Stop Stream")
	$(".cancel-stop-stream-btn").hide()
})

$(".stream-inactive-container .start-stream-btn").click(() => {
	$(".stream-inactive-container").addClass("fade-hidden")
	$(".start-stream-form").removeClass("hidden")
	setTimeout(() => {
		$(".stream-inactive-container").addClass("hidden")
		$(".start-stream-form").removeClass("fade-hidden")
	}, 300)
})

$(".start-stream-form .cancel-btn").click(() => {
	$(".start-stream-form").addClass("fade-hidden")
	setTimeout(() => {
		$(".stream-inactive-container").removeClass("hidden")
	}, 300)
	setTimeout(() => {
		$(".start-stream-form input").val("")
		$(".start-stream-form .input-container").removeClass("active")
		$(".start-stream-form .action-container").removeClass("active")
		$(".start-stream-form").addClass("hidden")
		$(".start-stream-form .send-notification-btn").removeClass("active")

		
		
		$(".stream-inactive-container").removeClass("fade-hidden")
	}, 400)
})

$(".start-stream-form .title-input").focus(() => {
	$(".start-stream-form .input-container").addClass("active")
})
  
$(".start-stream-form .title-input").focusout(() => {
	const val = $(".start-stream-form .title-input").val().replace(" ", "")
	if(val.length <= 0) {
		$(".start-stream-form .input-container").removeClass("active")
	}
})
  
$(".start-stream-form .title-input").on("input", () => {
	if($(".start-stream-form .title-input").val().replace(" ", "").length > 0) {
		$(".start-stream-form .action-container").addClass("active")
		$(".start-stream-form .input-container").removeClass("error")
	} else {
		$(".start-stream-form .action-container").removeClass("active")
	}
})

$(".reload-client-stream-source-btn").click(() => {
	$.post({
		url: "/admin/api/reloadStreamSource"
	})
})

$(".save-stream-title-btn").click(() => {
	const title = $('.stream-view-widget .stream-title').text()
	if(!title.replace(/ /gmi, "").length) {
		return $('.stream-view-widget .stream-title').addClass("error")
	} else {
		$('.stream-view-widget .stream-title').removeClass("error")
	}
	$.post({
		url: "/admin/api/saveStreamTitle",
		data: {title}
	})
})

$(() => { // POLL CONTROL

	$(".create-poll-btn").click(() => {
		$.get({
			url: "/admin/api/isPollActive",
			success: (data) => {
				if(!data.active) {
					openModal("create-poll-modal")
				} else {
					notification("Poll is currently active")
				}
			}
		})
		
	})

	$(".manage-poll-btn").click(() => {
		$.get({
			url: "/admin/api/isPollActive",
			success: (data) => {
				if(data.active) {
					openModal("manage-poll-modal")
				} else {
					notification("Poll is currently inactive")
				}
			}
		})
	})

	$(".see-prevous-poll-results-btn").click(() => {
		$.get({
			url: "/admin/api/recentPollResults",
			success: (data) => {
				$(".poll-results-modal .data-point").remove()
				data.forEach((r) => {
					$(".poll-results-modal .modal-content").append(`
						<p class="data-point">
							${r.value} - ${r.count}
						</p>
					`)
				})
				
				openModal("poll-results-modal")
			},
			error: () => {
				notification("No polls found")
			}
		})
	})

	$(".manage-poll-modal .end-poll-btn").click(() => {
		$.post({
			url: "/admin/api/endPoll",
			success: () => {
				closeModal("manage-poll-modal")
			}
		})
	})

	$(".confirm-create-poll-btn").click(() => {
		const data = {
			question: $(".create-poll-modal .question-input").val(),
			options: []
		}

		$(".create-poll-modal .option-input").each(function() {
			data.options.push({value: $(this).val()})
		})

		$.post({
			url: "/admin/api/createPoll",
			data: data,
			success: () => {
				closeModal("create-poll-modal")
			}
		})
	})

})

socket.on("loadCurrentStreamData", loadPage)
socket.on('slateChange', setSlate)
socket.on('reloadStreamSource', () => {
	if(!player) return;
	player.src(player.src())
	player.play()
	player.muted(false);
})
socket.on('updateStreamTitle', () => {
	$.get({
		url: "/api/getStreamInfo",
		success: (data) => {
			$('.stream-view-widget .stream-title').text(data.title)
		}
	})
})

loadPage()
setSlate()