var checkpointcount = 0 //change this to the number of checkpoints in the obby.

world.bricks.forEach((b) => {
	if (b.name.startsWith("Checkpoint")) {
		let cp = parseInt(b.name.replace("Checkpoint", ""))
		b.checkpoint = cp
		if (cp>checkpointcount) {
			checkpointcount=cp
		}
		b.touching((p) => {
			if (p.checkpoint+1==b.checkpoint) {
				p.checkpoint=b.checkpoint
				p.topPrint(`Checkpoint: ${p.checkpoint}/${checkpointcount}`, 100000)
				p.setScore(p.checkpoint)
				p.message("You reached a new checkpoint!")
				p.CheckPointPos=new Vector3(b.position.x+(b.scale.x/2),b.position.y+(b.scale.x/2),b.position.z+b.scale.z+1)
			}
		})
	}
})

Game.on("playerJoin", (p) => {
	p.checkpoint=1
	p.on("respawn", () => {
		p.topPrint(`Checkpoint: ${p.checkpoint}/${checkpointcount}`, 100000)
		if (p.checkpoint!==1) {
			p.setPosition(p.CheckPointPos)
		}
	})
	p.on("initialSpawn", () => {
		p.topPrint(`Checkpoint: ${p.checkpoint}/${checkpointcount}`, 100000)
		p.setScore(1)
	})
})