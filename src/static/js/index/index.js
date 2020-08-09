
var player;

$(document).ready(function(){
	if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)) {
		$(".stream-video").append('<video class="video-js" id="my-video" muted="muted" controls="controls" preload="auto" width="1920" height="1080" poster="/img/download.jpeg"><source class="vidSrc" src="https://stream.designtechhs.com/livestream/360p.m3u8" type="application/x-mpegURL"/></video>')
	} else {
		$(".stream-video").append('<video class="video-js" id="my-video" muted="muted" controls="controls" preload="auto" width="1920" height="1080" poster="/img/download.jpeg"><source class="vidSrc" src="https://stream.designtechhs.com/playlist.m3u8" type="application/x-mpegURL"/></video>')
	}
})

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
			player.muted(true);
		}).catch(error => {
			player.play();
			player.muted(true);
		})
	}
	player.muted(true);

	var checkPaused = setInterval(function(){
		if(player.paused()) {
			siteNotification(["data", {"input": "Your video is paused"}])
			clearInterval(checkPaused)
		}
	}, 1000)

	var checkMute = setInterval(function(){
		if(player.muted()) {
			siteNotification(["data", {"input": "Your video is muted"}])
			clearInterval(checkMute)
		}
	}, 1000)
	
	let errorTimeout;

	player.on('error', function(e) {
		if(errorTimeout) return;
		if(e.type == 'error') {
			errorTimeout = setTimeout(() => {
				player.src(player.src())
				player.play()
				player.muted(false);
				siteAlert(["local", {"input": "Unable to load livestream"}])
				errorTimeout = false;
			}, 5000)
		}
	})

},1000)

const setSlate = () => {
	$.get({
		url: "/api/getActiveSlate",
		success: (data) => {
			if(!data.active) return $('.slate').hide();
			$('.slate').show().css("background-image", `url(/img/slates/${data.src})`)
		}
	})
}

const setStreamInfo = () => {
	$.get({
		url: "/api/getStreamInfo",
		success: (data) => {
			$('.stream-info-container .stream-title').text(data.title)
			$('.stream-info-container .stream-runner').text(data.runner)
		}
	})
}

const setViewerCount = () => {
	$.get({
		url: "/api/getViewerCount",
		success: (count) => {
			$(".stream-info-container .viewer-count-container p").text(`${count} Viewers`)
		}
	})
}

$(document).ready(() => {
	setStreamInfo()
	setViewerCount()
	setInterval(setViewerCount, 20000)
})

$(() => { // Report Error
	
	const openModal = (divClass) => {
		$(`.report-error-modal`).addClass("active")
		$("body").addClass("modal-active")
	}

	
	
	const closeModal = (divClass) => {
		$(`.report-error-modal`).removeClass("active")
		$("body").removeClass("modal-active")
		$(".report-error-modal .error-type-select-wrap").attr("data-selected-option", "").removeClass("active")
		$(".report-error-modal .error-type-select-wrap .select-btn p").text("Select Error Type")
		$(".report-error-modal textarea").val("")
	}

	$('.report-error').click(function(){
		openModal()
	})

	$(".report-error-modal .select-btn").click((e) => {
		$(".report-error-modal .error-type-select-wrap").toggleClass("active")
		e.stopPropagation()
	})
	
	$(document).click(function(e) {
		$(".report-error-modal .error-type-select-wrap").removeClass("active")
	})

	$(".report-error-modal .error-type-select-wrap .select-menu .option").click(function() {
		let text = $(this).text(),
			type = $(this).attr("data-option")
		$(".report-error-modal .error-type-select-wrap").attr("data-selected-option", type)
		$(".report-error-modal .error-type-select-wrap .select-btn p").text(text)
	})

	$('.report-error-modal .close, .darken-overlay').click(function(){
		closeModal()
	})

	$('.report-error-modal .submit-report-btn').click(() => {
		var data = {
			type: $(".report-error-modal .error-type-select-wrap").attr("data-selected-option"),
			description: $(".report-error-modal .error-description").val()
		}
		if(!$(".report-error-modal .error-type-select-wrap").attr("data-selected-option")) {
			$(".report-error-modal .error-type-select-wrap").addClass("error")
			return;
		} else {
			$(".report-error-modal .error-type-select-wrap").removeClass("error")
		}
		$.post({
			url: '/api/submitError', 
			data: data,
			success:() => {
				closeModal()
				appendChat({
					chatId: "N/A",
					message: "✅✅✅ Thanks for reporting an error. Your feedback is greatly appreciated!",
					userName: "Team KoiStream",
					chatColor: "#07de67"
				})
			}
		});
	  })

})




socket.on('logoutAllStreamClients', function(data) {
	window.location.href = '/auth/logout'
})

socket.on('slateChange', setSlate)
setSlate()