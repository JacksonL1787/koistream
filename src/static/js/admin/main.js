const openModal = (divClass) => {
    $("body").addClass("modal-active")
    $(`.modal.${divClass}`).addClass("active")
}

const closeModal = (divClass) => {
    $("body").removeClass("modal-active")
    $(`.modal.${divClass}`).removeClass("active")
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
