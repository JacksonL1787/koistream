socket.on('siteNotification', function(data) {
    siteNotification(data)
})

socket.on('siteAlert', function(data) {
    siteAlert(data)
})

function siteNotification(data) { 
    var message = data[1].input
    var id = makeid(5)
    var idNW = makeid(5)
	$('.notif-wrapper').append('<div id="'+id+'" class="notif-wrapper-padder"></div><div id="'+idNW+'" class="notif-wrapper-object"> <div class="notif-wrapper-object-icon reg-image"></div> <div class="notif-wrapper-object-txt"> <p class="fullVertCenter">'+message+'</p> </div> </div>')
    setTimeout(function(){
        $("#" + id).addClass('active')
        $("#" + idNW).addClass('active')
    }, 100)
    setTimeout(function(){
        $("#" + id).fadeOut(1000)
        $("#" + idNW).removeClass('active')
        setTimeout(function(){
            $("#" + id).remove()
            $("#" + idNW).remove()
        }, 1000)
    }, 20000)
}

function siteAlert(data) {
    var message = data[1].input
    var id = makeid(5)
    var idNW = makeid(5)
	$('.notif-wrapper').append('<div id="'+id+'" class="notif-wrapper-padder"></div><div id="'+idNW+'" class="notif-wrapper-object"> <div class="notif-wrapper-object-icon reg-image"></div> <div class="notif-wrapper-object-txt"> <p class="fullVertCenter">'+message+'</p> </div> </div>')
    setTimeout(function(){
        $("#" + idNW).find('.notif-wrapper-object-icon').css('background-color', 'red')
        $("#" + idNW).find('.notif-wrapper-object-icon').css('background-image', 'url(/img/alert.svg)')
        $("#" + id).addClass('active')
        $("#" + idNW).addClass('active')
    }, 100)
    setTimeout(function(){
        $("#" + id).fadeOut(1000)
        $("#" + idNW).removeClass('active')
        setTimeout(function(){
            $("#" + id).remove()
            $("#" + idNW).remove()
        }, 1000)
    }, 20000)
}