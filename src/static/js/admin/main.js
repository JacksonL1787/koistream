const socket = io();
let modalCallback = () => {};

const openModal = (elem) => {
	if(!elem.hasClass("modal-container")) return;
	elem.addClass("active");
	$("body").addClass("inactive")
	$("#modal-active-overlay").addClass("active")
}

const closeModal = () => {
	$("#modal-active-overlay, .modal-container").removeClass("active")
	$("body").removeClass("inactive")
	setTimeout(modalCallback, 300)
}

const switchModal = (newModalElem) => {
	let currModalCallback = modalCallback
	$(".modal-container").removeClass("active")
	
	setTimeout(() => {
		currModalCallback()
		openModal(newModalElem)
	}, 300)
}

$(document).ready(() => {
    switch(window.location.pathname) {
        case "/admin/stream":
            $("#stream-nav-link").addClass("active")
            break;
        case "/admin/interactions":
            $("#templates-nav-link").addClass("active")
            break;
        case "/admin/users":
            $("#users-nav-link").addClass("active")
            break;
    } 
})


$(".close-modal-button").click(closeModal)
$("#modal-active-overlay").click(closeModal)