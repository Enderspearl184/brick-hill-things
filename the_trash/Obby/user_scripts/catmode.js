let catbrick = world.bricks.find(brick => brick.name=="9LivesBrick")

catbrick.touching((p) => {
	p.respawn()
	p.message("Use /cat to become slightly more like a cat.")
	p.message("In other words, you only have 9 lives.")
	p.message("Difficulty: * x 2")
})

Game.command("cat", async(p) => {
	if (p.checkpoint!==1 || p.catmode || p.specialmode) {
		return p.message("You must be at checkpoint 1 without any special modes enabled to use this.")
	}
	p.lives=9
	p.catmode=true
	p.respawn()
	p.message("You feel slightly more like a cat!")
})