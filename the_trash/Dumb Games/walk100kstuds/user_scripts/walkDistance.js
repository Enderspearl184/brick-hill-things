Game.on("initialSpawn", (p) => {
	p.setTeam(world.teams.find((t) => t.name=="Walking"))
	p.setInterval(function(){
		if (!p.won) {
			if (p.position.y>=0) {
				p.setScore(Math.floor(p.position.y))
			} else {
				p.setScore(0)
			}
			p.topPrint("Studs Walked: " + p.score, 100)
		} else {p.topPrint("YOU WON!!!!!!",100)}
	}, 100)
})