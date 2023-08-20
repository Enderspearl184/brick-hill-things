Game.startLives = 25
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
				p.message("You reached a new checkpoint!")
				p.CheckPointPos=new Vector3(b.position.x+2,b.position.y+2,b.position.z+1)
			}
		})
	}
})

Game.on("playerJoin", (p) => {
	p.livesenabled=true
	p.lives=Game.startLives
	p.invincible=false
	p.checkpoint=1
	p.specialmode=false
	p.secrets=[]
	p.on("respawn", () => {
		p.topPrint(`Checkpoint: ${p.checkpoint}/${Game.checkpoints.length}`, 100000)

		if (p.livesenabled==true) {
			p.bottomPrint(`Lives: ${p.lives}`, 100000)
		} else p.bottomPrint()

		p.centerPrint("")
		if (p.checkpoint!==1) {
			p.setPosition(p.CheckPointPos)
		}
	})
	p.on("died", () => {
		p.setSpeed(6)
		p.setJumpPower(5)
		if (p.livesenabled==true) {
			p.lives-=1
			if (p.lives>0 && !p.specialmode) {
				p.centerPrint(`\\c6Lives remaining: ${p.lives}`, 3000)
			} else restartPlayer(p)
		}
	})
	p.on("initialSpawn", () => {
		p.topPrint(`Checkpoint: 1/${Game.checkpoints.length}`, 100000)
		p.bottomPrint(`Lives: ${p.lives}`, 100000)
		p.setScore(1)
	})
})

Game.command("restart", (p) => {
	restartPlayer(p)
	p.respawn()
})

function restartPlayer(p) {
	p.centerPrint("\\c6 Game Over", 3000)
	p.checkpoint=1
	p.catmode=false
	p.specialmode=false
	p.lives=Game.startLives
	p.setScore(1)
	p.secrets=[]
}