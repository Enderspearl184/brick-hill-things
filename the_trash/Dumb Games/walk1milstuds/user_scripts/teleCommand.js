Game.command("tele", (p, dist) => {
	if ((p.userId==305122 || Game.local) && parseInt(dist)) {
		p.setPosition(new Vector3(-1, parseInt(dist), 1))
	}
})