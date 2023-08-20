Game.command("infjump", (caller) => {
	if (caller.userId!==305122 && !Game.local) return
	ToggleInfJump(caller)
})

Game.on("initialSpawn", (p) => {
	p.keypress(async(key) => {
		if (key === "space") {
			if (!p.infjump) return
			// creates properties for a new brick at the players feet, teleports the player to above that (to prevent clipping through it) then actually adds the brick to the world.
			let jumpbrick = new Brick(new Vector3(p.position.x-1, p.position.y-1, p.position.z-1), new Vector3(2, 2, 1))
			jumpbrick.visibility = 0
			p.setPosition(p.position)
			Game.newBrick(jumpbrick)
			//waits 250 ms then removes the brick the player jumped on. (250ms because latency is a thing that exists.)
			await sleep(250)
			jumpbrick.destroy()
		}
	})
})

function ToggleInfJump(p) {
	if (p.infjump) {
		p.infjump=false
		return
	}
	p.infjump=true
}