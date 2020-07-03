socket.on("reloadUnban", (gid) => {
    if(window.user.googleId === gid) {
        location.reload()
    }
})