let filter = {
    search: "",
    banned: false,
    muted: false
}

const appendUsers = (data) => {
    $(".loader").hide()
    $(".users-wrap .user").remove()
    if(!data.length) {
        if(!filter.banned && !filter.muted && !filter.search.trim().length) {
            $(".search-prompt").show()
        } else {
            $(".no-results").show().html(`No results for${filter.muted ? " <u>muted</u>" : ""}${filter.muted && filter.banned ? " and" : ""}${filter.banned ? " <u>banned</u>" : ""} users${filter.search.trim().length ? ` with the name/email <u>"${filter.search}"</u>` : ""}`)
        }
        return;
    }

    data.sort(function(a, b){
        if(a.firstName + a.lastName < b.firstName + b.lastName) { return -1; }
        if(a.firstName + a.lastName > b.firstName + b.lastName) { return 1; }
        return 0;
    })

    data.sort(function(a, b){
        if(a.online > b.online) { return -1; }
        if(a.online < b.online) { return 1; }
        return 0;
    })

    data.forEach((u) => {
        console.log(u)
        $(".users-wrap").append(`
            <div class="user" id="${u.googleId}" onclick="window.location.href='/admin/u/${u.googleId}'">
                <div class="user-content">
                    <div class="profile-picture" style="background-image: url(${u.googleProfilePicture});"></div>
                    <div class="info-container">
                        <p class="name">${_.startCase(u.firstName + " " + u.lastName)}</p>
                        <p class="email">${u.email}</p>
                    </div>
                </div>
                <div class="user-status ${u.online ? "online" : "offline"}">
                    <div class="status-dot"></div>
                    <p class="status-text">${u.online ? "Online" : "Offline"}</p>
                </div>
            </div>
        `)
    })
    $(".results-count").text(`${data.length} Results`).show()
}

let searchUsers;

const handleSearchInput = () => {
    if(searchUsers) clearTimeout(searchUsers)
    $(".users-wrap .user").remove()
    $(".search-prompt, .no-results, .results-count").hide()
    $(".loader").show()
    searchUsers = setTimeout(() => {
        $.post({
            url: "/admin/api/getUsers",
            data: filter,
            success: (data) => {
                appendUsers(data)
            }
        })
    }, 300)
}

$(".search-users-wrap .filter-btn").click(function() {
    $(this).toggleClass("active")
})

$(".search-users-wrap .search-input").on("input", function() {
    filter.search = $(this).val()
    handleSearchInput()
})

$(".search-users-wrap .banned-btn").click(function() {
    filter.banned = $(this).hasClass("active")
    handleSearchInput()
})

$(".search-users-wrap .muted-btn").click(function() {
    filter.muted = $(this).hasClass("active")
    handleSearchInput()
})

$(document).ready(() => {
    if($(".search-users-wrap .search-input").val().trim().length) {
        filter.search = $(".search-users-wrap .search-input").val()
        handleSearchInput()
    }
})