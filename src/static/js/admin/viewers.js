const updateInfo = (cb) => {
    
    $.get({
        url: "/admin/api/getViewers",
        success: (viewers) => {
            $(".no-viewers").hide()
            $(".page-title").text(`${viewers.length} ${viewers.length === 1 ? "Viewer" : "Viewers"}`)
            viewers.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            if(!viewers.length) {
                $(".no-viewers").show()
            } else {
                $(".viewers-table .info-row").remove()
                viewers.forEach((v) => {
                    $(".viewers-table").append(`
                        <tr class="info-row">
                            <td class="name-info">
                                <div class="profile-picture" style="background-image:url(${v.googleProfilePicture})"></div>
                                <p>${_.startCase(v.firstName + " " + v.lastName)}</p>
                            </td>
                            <td class="email-info">${v.email}</td>
                            <td class="join-time-info">${moment(v.timestamp).format('LLLL')}</td>
                        </tr>
                    `)
                })
            }
            
            cb()
        }
    })
}

const pageLoad = () => {
    $(".viewers-table .info-row").remove()
    updateInfo(() => {
        $(".loader").hide()
        $(".viewers-table").show()
        $(".page-title-wrap").css("display", "flex")
    })
}

$(".refresh-btn").click(() => {
    if($(".refresh-btn").hasClass("active")) return;
    $(".refresh-btn").addClass("active")
    setTimeout(() => {
        $(".refresh-btn").removeClass('active')
    }, 600)
    updateInfo()
})

pageLoad()