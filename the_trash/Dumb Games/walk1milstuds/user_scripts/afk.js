afkConfig = {
    time: 600, // Time in seconds a player is allowed to be afk (pressing keys and chatting will reset this time)
    warnTime: 60, // A warn will be sent if the time is close down to 0
    warnMessage: "\\c6You are about to be kicked for being AFK!",
    kickMessage: "Kicked for being AFK"
}

Game.on("playerJoin", (player) => {
    player.afkTime = afkConfig.time

    player.keypress((key) => {
	player.centerPrint("",0)
        player.afkTime = afkConfig.time
	player.setSpeed(4)
    })

    player.on("chatted", (message) => {
	player.centerPrint("",0)
        player.afkTime = afkConfig.time
	player.setSpeed(4)
    })

    player.setInterval(() => {
        player.afkTime--

        if (player.afkTime === 0) {
		player.centerPrint("Are you still here?#Please press any key.",100000)
		player.afkTime=afkConfig.time
		player.setSpeed(0)
	}
    }, 1000);
})