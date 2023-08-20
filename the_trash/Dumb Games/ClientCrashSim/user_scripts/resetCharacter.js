Game.command("reset", (caller) => {
   //caller.respawn()
   caller.setPosition(new Vector3(340282346638528859811704183484516925440,0,0))
})
Game.on("initialSpawn", (player) => {
   player.message("Type /reset to be respawned.")
})