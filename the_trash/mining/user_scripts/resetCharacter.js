Game.command("reset", (caller) => {
	caller.message("You have been respawned. Be careful out there!")
	return caller.respawn()
})
Game.on("playerJoin", (player) => {
   player.message("Type /reset to be respawned.")
})