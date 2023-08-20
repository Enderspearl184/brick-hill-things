Game.on("initialSpawn", (p) => {
	p.on("died", () => {
		if (!Game.settings.dayTime && p.survived) p.survived=false
		p.invincible=true
		setTimeout(()=>{
			p.invincible=false
		}, 10000)
	})
})