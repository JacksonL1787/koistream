
let notificationTimer;
let queueNotification;

const openModal = (divClass) => {
    $("body").addClass("modal-active")
    $(`.modal.${divClass}`).addClass("active")
}

const closeModal = (divClass) => {
    $("body").removeClass("modal-active")
    $(`.modal.${divClass}`).removeClass("active")
    $(`.modal.${divClass} textarea`).val("")
    $(`.modal.${divClass} input`).val("")
}

const hideNotification = () => {
    $(".notification").animate({
        opacity: 0,
        bottom: 30
    }, 300, () => {
        $(".notification").removeClass("active").css("display", "none").css("bottom", "10px")
    })
}

const notification = (message) => {
    if(notificationTimer) clearTimeout(notificationTimer)
    if(queueNotification) return;
    const activeNotification = $(".notification").hasClass("active")
    const timeoutTime = activeNotification ? 350 : 0
    if(activeNotification) hideNotification()
    queueNotification = true;
    setTimeout(() => {
        $(".notification .message").text(message)
        $(".notification").addClass("active").css("display", "flex").animate({
            opacity: 1,
            bottom: 20
        }, 300, () => {
            notificationTimer = setTimeout(hideNotification, 7500)
            queueNotification = false;
        })
        
    }, timeoutTime)
}

$(".modal-overlay").click(() => {
    closeModal("modal")
})

$(".modal .close").click(() => {
    closeModal("modal")
})

$("html").keydown((e) => {
    if(e.keyCode === 27 && $(".modal").hasClass("active")) {
        closeModal("modal")
    }
})

$(`.nav .link-wrap[href="${window.location.pathname}"]`).addClass("active")
setTimeout(() => {
    $(`.nav .link-wrap`).css("transition", "background .3s")
}, 1)

$(".page-container .menu-btn").click(() => {
    $("body").toggleClass("nav-inactive")
})

socket.on('adminNotification', (message) => {
    notification(message)
})