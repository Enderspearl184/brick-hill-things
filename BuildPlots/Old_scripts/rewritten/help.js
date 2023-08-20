Game.command("help", (p) => {
	p.message("======= Commands =======")
	p.message("/save - save your current build.")
	p.message("/load - load your saved build.")
	p.message("/paint (hex colour code) - change the colour of new bricks.")
	p.message("/reset - respawn yourself.")
	p.message("/model (asset id) - change the model of new bricks. If asset id is not specified, then the model is reset.")
	p.message("========================")
})