Game.on("initialSpawn", async(p) => {
	p.setScore(0)
	while (true) {
		await sleep(1000)
		p.setScore(p.score+1)
	}
})