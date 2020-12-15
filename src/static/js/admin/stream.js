let processingSlate = false;
let processingStream = false;


$("#reload-stream-source-button").click(() => {
	$.post({
        url: "/admin/api/reloadStreamSource"
    })
})

const setSlateControl = () => {
	$.get({
		url: "/user/api/getSlate",
		success: (data) => {
			if(!data.slate) return $(".slate-control-button").removeClass("active").find(".value").text("Slate Hidden")
			$(".slate-control-button").addClass("active").find(".value").text("Slate Shown")
			processingSlate = false;
		}
	})
}

const setStreamInfo = () => {
	$.get({
		url: "/user/api/getStreamInfo",
		success: (data) => {
			$(".stream-title-input").val(data.title)
			$(".stream-description-input").val(data.description)
		}
	})
}

$(".update-stream-information-button").click(() => {
	$.post({
        url: "/admin/api/updateStreamInfo",
        data: {
			title : $(".stream-title-input").val(),
			description: $(".stream-description-input").val()
		}
    })
})

$(".slate-control-button").click(() => {
	processingSlate = true;
	$.post({
        url: "/admin/api/updateSlate",
        data: {
            type: $(".slate-control-button").hasClass("active") ? "off" : 1
		}
    })
})


$(document).ready(() => {
    $(".video-preview-container .ratio-container").append('<video class="video-js" id="stream-video" controls="controls" preload="auto" width="1920" height="1080" poster="/img/video-poster.png" autoplay><source class="vidSrc" src="https://dviuhv1vhftjw.cloudfront.net/out/v1/ffab5e1f68414aaba7309406dacfa7df/stream.m3u8" type="application/x-mpegURL"/></video>')
	setSlateControl()
	setStreamInfo()
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
socket.on("slateChange", setSlateControl)