//sets player brick colour
Game.command("paint", (p, msg) => {
	if (msg.startsWith("#")) {
		p.brickcolor = msg //too simple or,
	} else p.brickcolor = `#${msg}`
})