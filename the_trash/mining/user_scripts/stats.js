const save=require('./save_load.js')

Game.on("playerJoin", (p) => {
	for (let t of p.inventory) {
		p.destroyTool(t)
	}
	let stats = save.load(p, "stats")

	if (stats==undefined) {
		p.stats={
			bagSize:200,
			Money:0
		}
		save.save(p, p.stats, "stats")
	} else {
		p.stats=stats
		p.setScore(stats.Money)
	}
	p.setInterval(function() {
		save.save(p, p.stats, "stats")
	}, 60000)
})

Game.on("playerLeave", async(p) => {
	save.save(p, p.stats, "stats")
})