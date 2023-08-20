Game.on("initialSpawn", (p) => {
	p.on("died", () => {
		if (!Game.settings.dayTime && p.survived) p.survived=false
	})
})