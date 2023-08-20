Game.command("reset", (caller) => {
	return caller.kill()
})
Game.on("playerJoin", (player) => {
   player.message("Type /reset to be respawned.")
})