
let autoScroll = true;

const scrollToBottom = () => {
    if(autoScroll) {
        $(".chat-widget .live-chat-container").scrollTop($(".chat-widget .live-chat-container")[0].scrollHeight)
    }
}

const appendChat = (data) => {
    $(".chat-widget .no-chats").hide()
    let message = $('<textarea/>').html(data.message).text();
    message = message.split(" ")
    let tempMessage = $('<textarea/>').html(data.unfilteredMessage).text().split(" ")
    message.forEach((w, i) => {
        if(w != tempMessage[i]) {
            message[i] = `<b class="flagged">${w}</b>`
        }
    })
    message = message.join(" ")
    message = '<span class="chat-text">' + message + '</span>'
    window.emojis.forEach((e) => {
        let re  = new RegExp(`:${e.tag}:`,"gmi")
        message = message.replace(re,`</span><span class="chat-emoji" data-tag="${e.tag}"><img class="chat-emoji-img" src="/img/customEmojis/${e.src}"></span><span class="chat-text">`)
    })
    message = message.replace(/\<span class="chat-text"\>\<\/span\>/gmi, "")
    $(".chat-widget .live-chat-container .chat-content").append(`
        <div class="chat" id="${data.chatId}">
            ${data.muted ? '<span class="muted">muted</span>' : ""} 
            <span class="chat-sender">${_.startCase(data.userName)}:</span>
            ${message}
        </div>
    `)
    $(".chat-widget .no-chats").hide()
    scrollToBottom()
}

const appendAllChats = () => {
    if(!window.chats || window.chats.length === 0) {
        $(".no-chats").show()
    }
    window.chats.forEach((chat) => {
        chat.userName = chat.firstName + " " + chat.lastName
        appendChat(chat)
    })
    $(".chat-widget .live-chat-container .loader").hide()
    $(".chat-widget .live-chat-container").scroll(    _.throttle(() => {
        const elem = $(".chat-widget .live-chat-container")
        if(elem[0].scrollTop + elem[0].offsetHeight === elem[0].scrollHeight) {
            autoScroll = true;
            $(".chat-widget .enable-autoscroll").removeClass('active')
        } else {
            autoScroll = false;
            $(".chat-widget .enable-autoscroll").addClass('active')
        }
    }, 50, {leading: true}))
    
    
    $(".chat-widget .enable-autoscroll").click(function() {
        autoScroll = true;
        $(this).removeClass("active")
        scrollToBottom()
    })
}

const appendEmojis = () => {
    $(".all-emojis-container").hide()
    if(window.emojis) {
        window.emojis.forEach((e) => {
            $(".custom-emojis-container").append(`
                <span class="custom-emoji" data-tag="${e.tag}" style="background-image: url(/img/customEmojis/${e.src});"></span>
            `)
        })
    }
    $.get({
        url: "https://emoji-api.com/emojis?access_key=af5e1a5b71241c442372c1cbaca5238f6edffad3",
        success: (data) => {
            data.forEach((e) => {
                if(e.character.trim().length <= 2 && e.codePoint != "263A FE0F") {
                    $(".chat-widget .emojis-container").append(`<div class="emoji" data-tags="${e.slug} ${e.subGroup} ${e.unicodeName}"><span>${e.character}</span></div>`)
                }
            })
            $(".all-emojis-container").show()
            $(".emoji-menu .loader").hide()
        }
    })
}

$(() => { // CHAT DETAILS
    const setChatDetails = (data) => {
        if(!data || data.length === 0) {
            console.log("test")
            $(".chat-details-widget .prompt-text").show()
            $(".chat-details-widget .loader, .chat-details-widget .chat-details-content").hide()
            return;
        }
        data = data[0]
        $(".chat-details-content .profile-picture").css("background-image", `url(${data.googleProfilePicture})`)
        $(".chat-details-content .user-name").text(_.startCase(data.firstName + " " + data.lastName))
        $(".chat-details-content .user-email").text(data.email)
        
        $(".chat-details-widget .chat-wrap .chat").remove()
        if(data.message === data.messageFiltered) {
            $(".chat-details-widget .chat-wrap.unfiltered").hide()
        } else {
            $(".chat-details-widget .chat-wrap.unfiltered").show()
        }
        for(let i = 0; i < 2; i++) {
            let message = $('<textarea/>').html(i === 1 ? data.message : data.messageFiltered).text();
            message = message.split(" ")
            let tempMessage = $('<textarea/>').html(i === 0 ? data.message : data.messageFiltered).text().split(" ")
            message.forEach((w, i) => {
                if(w != tempMessage[i]) {
                    message[i] = `<b class="flagged">${w}</b>`
                }
            })
            message = message.join(" ")
            message = '<span class="chat-text">' + message + '</span>'
            window.emojis.forEach((e) => {
                let re  = new RegExp(`:${e.tag}:`,"gmi")
                message = message.replace(re,`</span><span class="chat-emoji" data-tag="${e.tag}"><img class="chat-emoji-img" src="/img/customEmojis/${e.src}"></span><span class="chat-text">`)
            })
            message = message.replace(/\<span class="chat-text"\>\<\/span\>/gmi, "")
            $(`.chat-details-widget .chat-wrap${i === 1 ? ".unfiltered" : ".regular"}`).append(`
                <div class="chat">
                    ${message}
                </div>
            `)
        }
        

        $(".chat-details-content .mute-user-btn").attr("data-muted", data.muted)
        $(".chat-details-content .mute-user-btn").attr("data-google-id", data.googleId)
        $(".chat-details-content .mute-user-btn p").text(data.muted ? "Unmute User" : "Mute User")
        $(".chat-details-content .delete-chat-btn").attr("data-chat-id", data.chatId)
        $(".chat-details-widget .loader, .chat-details-widget .prompt-text").hide()
        $(".chat-details-widget .chat-details-content").show()
    }
    
    let getChatDetailsThrottle = _.throttle(function(chatId) {
        $.get({
            url: `/admin/api/chatDetails/${chatId}`,
            success: (data) => {
                setChatDetails(data)
            }
        })
    }, 500)
    
    $(document).on("click", ".chat-widget .chat", function() {
        if($(this).hasClass("active")) {
            $(".chat-details-widget .prompt-text").show()
            $(".chat-details-widget .loader, .chat-details-widget .chat-details-content").hide()
            $(".chat-widget .chat").removeClass("active")
            return;
        }
        if(!$(this).attr("id")) return;
        $(".chat-details-widget .prompt-text, .chat-details-widget .chat-details-content").hide()
        $(".chat-details-widget .loader").show()
        $(".chat-widget .chat").removeClass("active")
        $(this).addClass("active")
        getChatDetailsThrottle($(this).attr("id"))
    })
})

$('.chat-widget .emoji-btn .icon').click(function() {
    $(".emoji-menu").toggleClass("show")
})

$(document).on("click", ".emoji-menu .emoji", function() {
    const emoji = $(this).find("span").text().trim()
    $(".chat-widget .chat-input").val($(".chat-widget .chat-input").val() + emoji)
    $(".chat-widget .chat-input").focus()
})

$(document).on("click", ".emoji-menu .custom-emoji", function() {
    const emoji = `:${$(this).attr("data-tag")}:`
    console.log(emoji)
    $(".chat-widget .chat-input").val($(".chat-widget .chat-input").val() + emoji)
    $(".chat-widget .chat-input").focus()
})

$('.chat-widget .submit-chat-btn .icon').click(function(){
    var val = $('.chat-widget .chat-input').val()
    if(val.trim().length > 0) {
        var data = {
            "message": val
        }
        $.post({
            url: "/api/chat/sendMessage",
            data: data,
            success: (data) => {
                $(".emoji-menu").removeClass("show")
                $(".chat-widget .chat-input").val("")
            }
        });
    } else {
        log('Input insufficient')
    }
})

$('.chat-widget .chat-input').keypress((e) => {
    if(e.keyCode == 13) {
        e.preventDefault();
        $('.chat-widget .submit-chat-btn .icon').click();
    }
});

const deleteChat = (chatId) => {
    $(`.chat-widget .chat#${chatId}`).remove()
    if($(".chat-details-widget .delete-chat-btn").attr("data-chat-id") === chatId) {
        $(".chat-details-widget .prompt-text").show()
        $(".chat-details-widget .loader, .chat-details-widget .chat-details-content").hide()
        $(".chat-widget .chat").removeClass("active")
    }

    if($(".chat-widget .chat").length === 0) {
        $(".chat-widget .no-chats").show()
    }
}

const muteUser = (data) => {
    data.chats.forEach((id) => {
        let elem = $(`.chat-widget .chat#${id}`)
        if(data.muted) {   
            elem.prepend(`<span class="muted">muted</b>`)
        } else {
            elem.find(".muted").remove()
        }
        
    })
    if($(".chat-details-widget .mute-user-btn").attr("data-google-id") === data.googleId) {
        $(".chat-details-widget .prompt-text").show()
        $(".chat-details-widget .loader, .chat-details-widget .chat-details-content").hide()
        $(".chat-widget .chat").removeClass("active")
    }
}

$(".chat-details-widget .delete-chat-btn").click(function() {
    let chatId = $(this).attr("data-chat-id")
    $.post({
        url: "/admin/api/deleteChat",
        data: {
            chatId: chatId
        }
    })
})

$(".chat-details-widget .mute-user-btn").click(function() {
    let googleId = $(this).attr("data-google-id")
    $.post({
        url: "/admin/api/muteUser",
        data: {
            googleId: googleId
        }
    })
})

$.when(
    $.get("/api/emojis", (emojis) => {
        window.emojis = emojis
    }),

    $.get("/admin/api/liveChats", (chats) => {
        window.chats = chats
        
    })
).then(() => {
    appendAllChats()
    appendEmojis()
})

socket.on('newChatAdmin', appendChat)
socket.on('deleteChat', deleteChat)
socket.on('userMuted', muteUser)