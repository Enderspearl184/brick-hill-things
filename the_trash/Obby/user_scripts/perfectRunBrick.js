let prbrick = world.bricks.find(brick => brick.name=="PerfectRunBrick")

prbrick.touching(async(p) => {
	p.respawn()
	p.message("Use /pr to activate perfect run.")
	p.message("Perfect Run gives you one life to complete the entire obby.")
	p.message("Difficulty: * x 242")
})

Game.command("pr", async(p) => {
	if (p.checkpoint!==1 || p.catmode || p.specialmode) {
		return p.message("You must be at checkpoint 1 without any special modes enabled to use this.")
	}
	p.lives=1
	p.specialmode="pr"
	await p.respawn()
	p.message("Perfect Run activated!")
	p.setSpeech(`${p.username} (Perfect Run!)`)
	p.bottomPrint(`Lives: 1 (Perfect Run!)`, 100000)
})

Game.on("playerJoin", (p) => {
	p.on("chatted", (msg) => {
		if (p.specialmode && p.specialmode=="pr") {
			setTimeout(function() {
				p.setSpeech(`${p.username} (Perfect Run!)`)
			},3000)
		}
	})
})