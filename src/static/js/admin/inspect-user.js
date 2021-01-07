$(".back-button").click(() => {
    if(history.length != 1) return history.back()
    window.close()
})