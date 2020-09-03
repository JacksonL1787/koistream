let autoScroll = true;

const scrollToBottom = () => {
    if(autoScroll) {
        $(".chat-widget .live-chat-container").scrollTop($(".chat-widget .live-chat-container")[0].scrollHeight)
    }
}

const deleteChat = (chatID) => {
    $(`.chat-widget .live-chat-container .chat-content #${chatID}`).remove()
}

const appendChat = (data) => {
    $('.chat-widget .chat-content .chat.cooldown').remove()
    let message = $('<textarea/>').html(data.message).text();
    console.log(data)
    message = `<span class="chat-text">${message}</span>`
    window.emojis.forEach((e) => {
        let re  = new RegExp(`:${e.tag}:`,"gmi")
        message = message.replace(re,`</span><span class="chat-emoji" data-tag="${e.tag}"><img class="chat-emoji-img" src="/img/customEmojis/${e.src}"></span><span class="chat-text">`)
    })
    message = message.replace(/\<span class="chat-text"\>\<\/span\>/gmi, "")
    $(".chat-widget .live-chat-container .chat-content").append(`
        <div class="chat" id="${data.chatId}">
            ${data.chatTag ? `<span class="chat-tag admin">${data.chatTag}</span>` : ""}
            <span class="chat-sender">${data.userName === "Team KoiStream" ? data.userName : _.startCase(data.userName)}:</span>
            ${message}
        </div>
    `)
    $(".chat-widget .no-chats").hide()
    scrollToBottom()
}

const appendAllChats = () => {
    $(".chat-widget .chat").show()
    if(!window.chats || window.chats.length <=  0) {
        $(".chat-widget .no-chats").show()
        $(".chat-widget .chat-content .loader").hide()
        return;
    }
    window.chats.forEach((chat) => {
        chat.userName = chat.firstName + " " + chat.lastName
        appendChat(chat)
    })
    $(".chat-widget .chat-content .loader").hide()
    $(".chat-widget .live-chat-container").scroll(_.throttle(() => {
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

const setChatStatus = (update) => {
    $.get({
        url: "/api/chatStatus",
        success: (status) => {
            const statusColors = {
                disabled: "#db1212",
                muted: "#db1212",
                active: "#00c47c"
            }
            $(".chat-widget .title-container .chat-status").css("color", statusColors[status]).text(status)
            if(update) $(".chat-widget .chat:not(.announcement)").remove()
            
            if(status === "disabled" || status === "muted") {
                $(".chat-widget").addClass("disabled")
            } else {
                $(".chat-widget").removeClass("disabled")
                if(update) appendAllChats()
            }
        }
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
                if(e.character.trim().length <= 2 && e.codePoint != "263A FE0F" && e.character != "🥲") {
                    $(".chat-widget .emojis-container").append(`<div class="emoji" data-tags="${e.slug} ${e.subGroup} ${e.unicodeName}"><span class="char22">${e.character}</span></div>`)
                }
            })
            $(".all-emojis-container").show()
            $(".emoji-menu .loader").hide()
        }
    })
}



socket.on('newChat', appendChat)

socket.on('chatStatusChange', (status) => {
    window.stream.chatSettings.status = status
    setChatStatus(true)
})

socket.on("deleteChat", deleteChat)

socket.on('muteUser', (status) => {
    window.user.muted = status
    setChatStatus(true)
})

$(document).on("click", function (event) {
    if ($(event.target).closest(".emoji-menu").length === 0 && $('.emoji-menu').hasClass('show')) {
        $('.emoji-menu').removeClass('show')   
    } else {
        if($(event.target).is('.emoji-btn .icon')) {
            $('.emoji-menu').addClass('show')
        }
    }
  });

$(document).on("click", ".emoji-menu .emoji", function() {
    const emoji = $(this).find("span").text().trim()
    $(".chat-widget .chat-input").val($(".chat-widget .chat-input").val() + emoji)
    $(".chat-widget .chat-input").focus()
})


$(document).on("click", ".emoji-menu .custom-emoji", function() {
    const emoji = `:${$(this).attr("data-tag")}:`
    $(".chat-widget .chat-input").val($(".chat-widget .chat-input").val() + emoji)
    $(".chat-widget .chat-input").focus()
})

$('.chat-widget .submit-chat-btn .icon').click(function(){
    var val = $('.chat-widget .chat-input').val()
    $('.chat-widget .chat-input').val("")
    if(val.trim().length > 0) {
        var data = {
            "message": val
        }
        $.post({
            url: "/api/sendMessage",
            data: data,
            success: (data) => {
                $(".emoji-menu").removeClass("show")
                if(typeof(data) === "object") {
                    if(data.type === "disabled") {
                        setChatStatus(true)
                    } else if(data.type === "chat") {
                        appendChat(data)
                        $('.chat-widget .chat-input').val("")
                    } else if (data.type === "cooldown") {
                        $('.chat-widget .chat-content .chat.cooldown').remove()
                        $(".chat-widget .live-chat-container .chat-content").append(`
                            <p class="chat cooldown">
                                Wait ${data.timeLeft} seconds before chatting again.
                            </p>
                        `)
                        $(".chat-widget .live-chat-container").scrollTop($(".chat-widget .live-chat-container")[0].scrollHeight)
                    } else if (data.type === "maxchar") {
                        $('.chat-widget .chat-content .chat.cooldown').remove()
                        $(".chat-widget .live-chat-container .chat-content").append(`
                            <p class="chat cooldown">
                                Your message exceeds the ${data.charLim} character limit.
                            </p>
                        `)
                        $(".chat-widget .live-chat-container").scrollTop($(".chat-widget .live-chat-container")[0].scrollHeight)
                    }
                    
                }
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

$(document).ready(() => {
    //window.stream.liveChats = window.stream.liveChats.sort((a, b) =>  a.timestamp - b.timestamp)
    setChatStatus(false)
})

$.when(
    $.get("/api/emojis", (emojis) => {
        window.emojis = emojis
    }),

    $.get("/api/liveChats", (chats) => {
        window.chats = chats
        
    })
).then(() => {
    appendAllChats()
    appendEmojis()
})

socket.on("updateChatStatus", () => {
    setChatStatus(true)
})