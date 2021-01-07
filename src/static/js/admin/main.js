const socket = io();

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