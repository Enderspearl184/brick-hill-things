Game.checkpoints = []

world.bricks.forEach((b) => {
	if (b.name.startsWith("Checkpoint")) {
		b.checkpoint = parseInt(b.name.replace("Checkpoint", ""))
		Game.checkpoints.push(b)
		b.touching((p) => {
			if (p.checkpoint+1==b.checkpoint) {
				p.checkpoint=b.checkpoint
				p.topPrint(`Checkpoint: ${p.checkpoint}/${Game.checkpoints.length}`, 100000)
				p.setScore(p.checkpoint)
				//p.message("You reached a new checkpoint!")
				p.CheckPointPos=new Vector3(b.position.x+2,b.position.y+2,b.position.z+1)
			}
		})
	}
})

Game.on("playerJoin", (p) => {
	p.livesenabled=false
	p.lives=Infinity
	//p.invincible=false //leftover from old obby, i could make myself invincible (for testing reasons, definitely not just because im bad at the game)
	p.checkpoint=1
	//p.secrets=[] //other leftover from old obby, secrets that let you skip a checkpoint (one use each)
	p.on("respawn", () => {
		p.topPrint(`Checkpoint: ${p.checkpoint}/${Game.checkpoints.length}`, 100000)

		if (p.livesenabled) {
			p.bottomPrint(`Lives: ${p.lives}`, 100000)
		} else p.bottomPrint("")

		p.centerPrint("")
		if (p.checkpoint!==1) {
			p.setPosition(p.CheckPointPos)
		}
		console.log(p.livesenabled)
		console.log(p.lives)
	})
	p.on("died", () => {
		if (p.livesenabled) {
			p.lives-=1
			if (p.lives>0) {
				p.centerPrint(`\\c6Lives remaining: ${p.lives}`, 3000)
			} else restartPlayer(p)
		} else {
			p.centerPrint(`\\c6YOU DIED`,3000)
		}
	})
	p.on("initialSpawn", () => {
		p.topPrint(`Checkpoint: 1/${Game.checkpoints.length}`, 100000)
		//p.bottomPrint(`Lives: ${p.lives}`, 100000)
		p.setScore(1)
	})
})

Game.command("easy", (p) => {
	p.lives=Infinity
	p.livesenabled=false
	restartPlayer(p)
	p.respawn()
})

Game.command("hard", (p, lives) => {
	if (isNaN(parseInt(lives)) && parseInt(lives)>0) {
		return p.message("Invalid lives count.")
	}
	p.lives=parseInt(lives)
	p.livesenabled=true
	restartPlayer(p)
	p.respawn()
})

function restartPlayer(p) {
	p.centerPrint("\\c6 Game Over", 3000)
	p.checkpoint=1
	//p.secrets=[]
	p.lives=Infinity
	p.livesenabled=false
	p.setScore(1)
}