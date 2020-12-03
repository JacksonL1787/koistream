$(".reload-stream-source").click(() => {
    $.post({
        url: "/admin/api/reloadStreamSource"
    })
})

$(".turn-slate-on").click(() => {
    $.post({
        url: "/admin/api/updateSlate",
        data: {
            type: 1
        }
    })
})

$(".turn-slate-off").click(() => {
    $.post({
        url: "/admin/api/updateSlate",
        data: {
            type: "off"
        }
    })
})

$(".start-poll").click(() => {
    $.post({
        url: "/admin/api/startPoll"
    })
})

$(".end-poll").click(() => {
    $.post({
        url: "/admin/api/endPoll",
        success: (data) => {
            let string = ""
            data.forEach((dp) => {
                string += `${dp.value} - ${dp.voteCount} <br><br>`
            })
            $(".poll-results").html(string)
        }
    })
})