const setData = (data) => {
    $(".loader").hide()
    $(".page-title").show()
    if(data.online) {
        $(".user-status").addClass("online")
        $(".user-status p").text("Currently online")
    } else {
        $(".user-status").addClass("offline")
        $(".user-status p").text(`Last online ${moment(new Date(data.lastOnline)).format('LLLL')}`)
    }
    
}

setTimeout(() => {
    $.get({
        url: `/admin/api/userDetails/${window.googleId}`,
        success: (data) => {
            setData(data)
        }
    })
}, 300)
