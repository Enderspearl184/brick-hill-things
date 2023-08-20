Game.on("playerJoin", (player) => {
	player.on("initialSpawn", () => {
		createBrick(player)
	})
})

function createBrick(p) {
	let brick = new Brick(p.position, new Vector3(1,1,1), "#f54242")
	brick.visibility = 0
	brick.collision=false
	brick.name="dns"
	brick.lightEnabled=true
	brick.lightRange=1000
	brick.lightColor="#b1b1b1"
	brick.position=p.position
	Game.newBrick(brick)
	p.brick=brick
	var lastposition=new Vector3(p.position.x, p.position.y, p.position.z)
	brick.setInterval(() => {
		if (p.destroyed) return brick.destroy()
		if (p.position.x !== lastposition.x || p.position.y !== lastposition.y || p.position.z !== lastposition.z+4) {
			lastposition.x=p.position.x
			lastposition.y=p.position.y
			lastposition.z=p.position.z+4
			brick.setPosition(new Vector3(p.position.x, p.position.y, p.position.z+4))
			brick.setCollision(false)
		}
	}, 2000);
}