Game.command("tele", (p, dist) => {
	if (p.userId==305122 && parseInt(dist)) {
		p.setPosition(new Vector3(-1, parseInt(dist), 1))
	}
})