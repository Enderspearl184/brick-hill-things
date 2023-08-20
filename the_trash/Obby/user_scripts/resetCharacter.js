Game.command("reset", (caller) => {
	if (caller.inTutorial) {
		caller.inTutorial=false
		caller.setScore(caller.checkpoint)
		caller.respawn()
	} else return caller.kill()
})
Game.on("playerJoin", (player) => {
   player.message("Type /reset to be respawned.")
})