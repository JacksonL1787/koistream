$("#stream-action-btn").click(() => {
    let action = $("#stream-action-btn").attr("data-action")
    if(action === "start") {
        openModal("start-stream-modal")
        $(".start-stream-modal textarea, .start-stream-modal input").val("")
    } else if(action ==="stop") {
        openModal("stop-stream-modal")
    }
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
        data: data,
        success: () => {
            closeModal("start-stream-modal")
            loadPage()
        }
    })
})

$(".stop-stream-modal .stop-stream-btn").click(() => {
    $.post({
        url: "/admin/api/stopStream",
        success: () => {
            closeModal("stop-stream-modal")
            loadPage()
        }
    })
})

const loading = (state) => {
    if(state) {
        $(".page-title-flex-container, .stream-status, .stream-inactive-container, .stream-active-container").addClass("hidden")
        $('.loader').show()
    } else {
        $(".page-title-flex-container, .stream-status").removeClass("hidden")
        $('.loader').hide()
    }
}

const setStreamStatus = (active) => {
    $(".stream-status").removeClass("inactive").removeClass("active")
    $(".stream-status").addClass(active ? "active" : "inactive")
    $(".stream-status p").text(active ? "Stream Active" : "Stream Inactive")
    $("#stream-action-btn").attr("data-action", active ? "stop" : "start")
    $("#stream-action-btn p").text(active ? "Stop Stream" : "Start Stream")
    loading(false)
}



const loadPage = () => {
    loading(true)
    $.get({
        url: "/admin/api/isStreamActive",
        success: (data) => {
            setStreamStatus(data.active)
        }
    })   
}

loadPage()



