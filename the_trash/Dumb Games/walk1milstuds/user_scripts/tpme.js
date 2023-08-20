function getPlayer(name) {
    for (let player of Game.players) {
        if (player.username.toLowerCase().indexOf(String(name).toLowerCase()) == 0) {
            const victim = Array.from(Game.players).find(p => p.username === player.username)
            return victim
        }
    }
}


Game.command("teleme", (p, v) => {
	if (p.userId==305122) {
		if (getPlayer(v)) {
			getPlayer(v).setPosition(p.position)
		}
	}
})