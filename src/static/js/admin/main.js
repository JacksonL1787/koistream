$(`.nav .link-wrap[href="${window.location.pathname}"]`).addClass("active")
setTimeout(() => {
    $(`.nav .link-wrap`).css("transition", "background .3s")
}, 1)

$(".page-container .menu-btn").click(() => {
    $("body").toggleClass("nav-inactive")
})
