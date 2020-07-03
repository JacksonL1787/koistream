const communityMeetingTime = moment(upcomingStream.startTime).valueOf();
const currentTime = Date.now();
const diffTime = communityMeetingTime - currentTime
let duration = moment.duration(diffTime, 'milliseconds');

const setTimer = (duration) => {
    const time = {
        weeks: duration.weeks(),
        days: duration.days(),
        hours: duration.hours(),
        minutes: duration.minutes(),
        seconds: duration.seconds()
    }

    $(".weeks-container h1").text(time.weeks)
    $(".days-container h1").text(time.days)
    $(".hours-container h1").text(time.hours)
    $(".minutes-container h1").text(time.minutes)
    $(".seconds-container h1").text(time.seconds)

}  

const runTimer = () => {
    setInterval(() => {
        duration = moment.duration(duration - 1000, 'milliseconds');
        setTimer(duration)
    }, 1000)
}

$(".logo-container").click(() => window.location.hef="/")


$(document).ready(() => {
    setTimer(duration)
    runTimer()
})