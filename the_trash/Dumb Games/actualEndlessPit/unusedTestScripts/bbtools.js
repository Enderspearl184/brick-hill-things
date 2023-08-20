// BBTools by SmartLion, but slightly modified
// Partial code from cheats' admin
// Used for new btools for cheats' admin

// SemVer 0.0.1?
//debug normally is -55.7
let debug = -57.7

Game.on("playerJoin", (player) => {
    player.brickcolor = "#f54242"
    player.brickplacement = 0
    player.brickSize = 1
    player.on("initialSpawn", () => {
	bunnyplr(player)
        let brick = new Brick(new Vector3(0, 0, 0), new Vector3(1, 3, 1), "#f54242")
        brick.visibility=0
        brick.collision=false //HOWHOOHOWHOHOWHOHWOHWO
        Game.newBrick(brick)
        brick.name = "buildingcore"
	player.brick=brick
        brick.setInterval(() => {
            var rotx = player.position.x + 4 * Math.sin(player.rotation.z / debug + 89.6)
            var roty = player.position.y - 4 * Math.cos(player.rotation.z / debug + 89.6)
            brick.setColor(player.brickcolor)
            brick.setPosition(new Vector3(rotx -= brick.scale.x /1.5 ,roty -= brick.scale.y /1.5,player.position.z))
            if (player.destroyed == true) {
                brick.destroy()
            }
        }, 80);
    })
 })

async function bunnyplr(player) {
	for (let bricks of world.bricks) {
		if (bricks.name=="bunny") {
			let brick = new Brick()
			brick.visibility=1
			brick.collision=false
			brick.shape=await bricks.shape
			Game.newBrick(brick)
			brick.setColor(bricks.color)
			brick.setScale(bricks.scale)
			brick.setInterval(() => {
				console.log(player.rotation.z)
				let pos = player.brick.position
				brick.setPosition(new Vector3(pos.x+(bricks.position.x+50),pos.y+(bricks.position.y+50),pos.z+bricks.position.z))
			}, 80);
		}
	}
}
