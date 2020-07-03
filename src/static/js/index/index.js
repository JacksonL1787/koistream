
var player;

$(document).ready(function(){
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)) {
    console.log('mobile device loading')
    $(".stream-video").append('<video class="video-js" id="my-video" muted="muted" controls="controls" preload="auto" width="1920" height="1080" poster="/img/download.jpeg"><source class="vidSrc" src="https://stream.designtechhs.com/livestream/360p.m3u8" type="application/x-mpegURL"/></video>')
  } else {
    $(".stream-video").append('<video class="video-js" id="my-video" muted="muted" controls="controls" preload="auto" width="1920" height="1080" poster="/img/download.jpeg"><source class="vidSrc" src="https://stream.designtechhs.com/playlist.m3u8" type="application/x-mpegURL"/></video>')
  }
})

setTimeout(function(){
  videojs.options.hls.overrideNative = true;
  // Player instance options
  var options = {
    html5: {
      nativeAudioTracks: false,
      nativeVideoTracks: false
    }
  };
  player = window.player = videojs('#my-video', options);

  let qualityLevels = player.qualityLevels();
  let videoPlay = player.play();
  let videoMute = player.muted();

  player.hlsQualitySelector();

  if(videoPlay !== undefined) {
    videoPlay.then(_ => {
      player.play();
      player.muted(false);
    }).catch(error => {
      player.play();
      player.muted(false);
    })
  }

  var checkPaused = setInterval(function(){
    if(player.paused()) {
      siteNotification(["data", {"input": "Your video is paused"}])
      clearInterval(checkPaused)
    }
  }, 1000)

  var checkMute = setInterval(function(){
    if(player.muted()) {
      siteNotification(["data", {"input": "Your video is muted"}])
      clearInterval(checkMute)
    }
  }, 1000)

  player.on('error', function(e) {
    if(e.type == 'error') {
      siteAlert(["local", {"input": "Unable to load livestream"}])
    }

    if($('.vjs-modal-dialog-content').text() == "The media could not be loaded, either because the server or network failed or because the format is not supported.TextColorWhiteBlackRedGreenBlueYellowMagentaCyanTransparencyOpaqueSemi-TransparentBackgroundColorBlackWhiteRedGreenBlueYellowMagentaCyanTransparencyOpaqueSemi-TransparentTransparentWindowColorBlackWhiteRedGreenBlueYellowMagentaCyanTransparencyTransparentSemi-TransparentOpaqueFont Size50%75%100%125%150%175%200%300%400%Text Edge StyleNoneRaisedDepressedUniformDropshadowFont FamilyProportional Sans-SerifMonospace Sans-SerifProportional SerifMonospace SerifCasualScriptSmall CapsReset restore all settings to the default valuesDone") {
      $('.slate').show()
    } else {
      $('.slate').hide()
    }

  })

},1000)

socket.on('reloadStreamClients', function(data) {
  player.src(player.src())
  player.play()
  player.muted(false);
})

socket.on('logoutAllStreamClients', function(data) {
  window.location.href = '/auth/logout'
})

const setSlate = (data) => {
  if(!data.active) $('.slate').hide();
  $('.slate').show()
  if(data.type === 1) {
    $('.slate').css('background-image', 'url("/img/koistream-off-slate.png")')
  } else if(data.type === 2) {
    $('.slate').css('background-image', 'url("/img/2880px-SMPTE_Color_Bars_16x9.svg.png")')
  } else if(data.type === 3) {
    $('.slate').css('background-image', 'url("/img/download.jpeg")')
  } else if(data.type === 4) {
    $('.slate').css('background-image', 'url("/img/maintainence.jpg")')
  } else {
    $('.slate').css('background-image', 'url("/img/koistream-off-slate.png")')
  }
}

socket.on('slateControl', setSlate)

$.get({
  url: "/api/slate",
  success: setSlate
})

socket.on('participantsChange', function(count){
$(".stream-info-container .viewer-count-container p").text(`${count} Viewers`)
})

$(document).ready(() => {
$('.stream-info-container .stream-title').text(stream.name)
$('.stream-info-container .stream-runner').text(stream.runner)
$(".stream-info-container .viewer-count-container p").text(`${stream.participantCount + 1} Viewers`)
})

window.onload = () => {
  setTimeout(() => {
    socket.emit('initParticipant', window.user.googleId)
  }, 3000)
}

$('.report-error').click(function(){
    takeShots()
});

let readyToTriggerError = false;
let errorImages;

async function takeShots() {
  const imgArray = await fetchScreenshot(4, 2000)
  errorImages = imgArray
  setTimeout(function(){
    readyToTriggerError = true
  },500)
}

function fetchScreenshot(shots, timebetween) {
  return new Promise(resolve => {
    let images = []
    for(var i = 0; i < shots; i++) {
      if(i == 0) {
        log('first photo')
        html2canvas($('html'), {letterRendering: 1, logging: true, allowTaint : true, useCORS: true, onrendered: function (canvas) {
            let img = canvas.toDataURL("image/jpeg")
            images.push({img, "timestamp": Date.now()})
          }
        });
      } else {
        timebetween + timebetween
        setTimeout(function(){
          html2canvas($('html'), {letterRendering: 1, allowTaint : true, useCORS: true, onrendered: function (canvas) {
              let img = canvas.toDataURL("image/jpeg")
              images.push({img, "timestamp": Date.now()})
            }
          });
          if(i == shots) {
            resolve(images)
          }
        }, timebetween + 1000)
      }
    }
  })
}