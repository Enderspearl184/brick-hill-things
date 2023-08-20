//allows the player to use /reset if they somehow get stuck
Game.command("reset", (caller) => {
	return caller.kill()
})
Game.on("playerJoin", (player) => {
   player.message("Type /reset to be respawned.")
})