let updateTimer;

const loading = (state) => {
    if(state) {
        $(".page-title-flex-container, .stream-status, .stream-inactive-container, .stream-active-container").addClass("hidden")
        $('.loader').show()
    } else {
        $(".page-title-flex-container, .stream-status").removeClass("hidden")
        $('.loader').hide()
    }
}

const setSlate = () => {
    $.get({
        url: "/api/getActiveSlate",
        success: (data) => {
            if(!data.active) return $('.stream-video .slate').hide();
            $('.stream-video .slate').show().css("background-image", `url(/img/slates/${data.src})`)
            if($(".slate-control-widget .slate-select .slate-option").length <= 1) return;
            $(".slate-control-widget .slate-select .slate-option").removeClass("active")
            $(`.slate-control-widget .slate-select .slate-option[data-type="${data.active ? data.type : "off"}"]`).addClass("active")
        }
    })
}

const setActiveStream = (data) => {
    console.log(data)
    data.startTime = new Date(data.startTime)
    $(".stream-timer-widget .start-time").text(`Started on ${moment(data.startTime).format("dddd, LL")} at ${moment(data.startTime).format("LT")}`)
    if(updateTimer) clearTimeout(updateTimer)
    const setStreamTimer = () => {
        let h = new Date(Date.now() - data.startTime).getUTCHours() + "",
            m = new Date(Date.now() - data.startTime).getUTCMinutes() + "",
            s = new Date(Date.now() - data.startTime).getUTCSeconds() + ""
        $(".stream-timer-widget .timer .hours-wrap .time").text(h.length == 2 ? h : "0" + h)
        $(".stream-timer-widget .timer .minutes-wrap .time").text(m.length == 2 ? m : "0" + m)
        $(".stream-timer-widget .timer .seconds-wrap .time").text(s.length == 2 ? s : "0" + s)
    }
    setStreamTimer()
    updateTimer = setInterval(setStreamTimer, 1000)
    $(".stream-active-container").removeClass("hidden")
    $(".stream-view-widget .stream-title").text(data.title)
    $(".stream-view-widget .stream-runner").text(data.runner)
    $(".stream-view-widget .stream-video video, .slate-control-widget .slate-select .slate-option:not(.off-slate)").remove()
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)) {
        console.log('mobile device loading')
        $(".stream-view-widget .stream-video").append('<video class="video-js" id="my-video" muted="muted" controls="controls" preload="auto" width="1920" height="1080" poster="/img/countdown-bg.png"><source class="vidSrc" src="https://stream.designtechhs.com/livestream/360p.m3u8" type="application/x-mpegURL"/></video>')
      } else {
        $(".stream-view-widget .stream-video").append('<video class="video-js" id="my-video" muted="muted" controls="controls" preload="auto" width="1920" height="1080" poster="/img/countdown-bg.png"><source class="vidSrc" src="https://stream.designtechhs.com/playlist.m3u8" type="application/x-mpegURL"/></video>')
      }
    $(".started-by .user").attr("href", `/admin/u/${data.googleId}`)
    $(".started-by .user .profile-picture").css("background-image", `url(${data.googleProfilePicture})`)
    $(".started-by .user .user-name").text(_.startCase(data.firstName + " " + data.lastName))
    data.slates.forEach((s) => {
        $(".slate-control-widget .slate-select").append(`
            <div class="slate-option ${s.active ? "active" : ""}" data-type="${s.type}">
                <p class="title">${s.name}</p>
                <img src="/img/slates/${s.src}">
            </div>
        `)
    })
    if($(".slate-control-widget .slate-select .slate-option.active").length === 0) {
        $('.slate-control-widget .slate-select .slate-option[data-type="off"]').addClass("active")
    }
}

const setInactiveStream = () => {

}

const setStreamStatus = (active) => {
    $(".stream-status").removeClass("inactive").removeClass("active")
    $(".stream-status").addClass(active ? "active" : "inactive")
    $(".stream-status p").text(active ? "Stream Active" : "Stream Inactive")
    $("#stream-action-btn").attr("data-action", active ? "stop" : "start")
    $("#stream-action-btn p").text(active ? "Stop Stream" : "Start Stream")
    if(active) {
        $.get({
            url: "/admin/api/activeStream",
            success: setActiveStream
        })
    } else {
        $.get({
            url: "/admin/api/previousStreams",
            success: setInactiveStream
        })
    }
    setTimeout(() => {
        loading(false)
    }, 300)
    
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

$("#stream-action-btn").click(() => {
    let action = $("#stream-action-btn").attr("data-action")
    if(action === "start") {
        openModal("start-stream-modal")
        $(".start-stream-modal textarea, .start-stream-modal input").val("")
    } else if(action ==="stop") {
        openModal("stop-stream-modal")
    }
})

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

$(".start-stream-modal .start-stream-btn").click(() => {

    const data = {
        title: $(".start-stream-modal .stream-title").val(),
        runner: $(".start-stream-modal .stream-runner").val()
    }

    if(data.title.trim().length <= 0) {
        $(".start-stream-modal .stream-title").addClass("error")
    } else {
        $(".start-stream-modal .stream-title").removeClass("error")
    }

    if(data.runner.trim().length <= 0) {
        $(".start-stream-modal .stream-runner").addClass("error")
    } else {
        $(".start-stream-modal .stream-runner").removeClass("error")
    }

    $.post({
        url: "/admin/api/startStream",
        data: data
    })
})

$(".stop-stream-modal .stop-stream-btn").click(() => {
    $.post({
        url: "/admin/api/stopStream"
    })
})

socket.on("loadCurrentStreamData", loadPage)
socket.on('slateChange', setSlate)

loadPage()
setSlate()