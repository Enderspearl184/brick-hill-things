const config = {
    maxDetectionPoints: 7,
    detectionLossRate: 30000,
    abnormalKeepaliveTime: 9000
}
Game.on("initialSpawn", (player) => {
    player.lastHeartbeat = new Date()
    player.detectionPoints = 0

    clearTimeout(player.socket.keepalive.timer)
    let timer = null
    player.socket.keepalive.restartTimer = () => {
        if (timer) clearTimeout(timer)
        timer = setTimeout(player.socket.keepalive.kickIdlePlayer, 30000)

        //console.log("Heartbeat", -(player.lastHeartbeat - new Date()))
        if (-(player.lastHeartbeat - new Date()) < config.abnormalKeepaliveTime) {
            player.detectionPoints++
            //console.log("Added detection point", player.detectionPoints)
            if (player.detectionPoints > config.maxDetectionPoints) {
                player.kick("noob detected")
            }
        }
        player.lastHeartbeat = new Date()
    }

    player.setInterval(() => {
        if (player.detectionPoints > 0) player.detectionPoints--
    }, config.detectionLossRate)
})