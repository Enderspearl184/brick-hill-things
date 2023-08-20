var brickmodule = require("./add_remove_brick.js")
let debug = -57.7

function createBuildCore(player) {
	if (player.buildcore) {
		brickmodule.removebrick(player, player.buildcore, true)
	}
	console.log("creating buildcore for :" + player.username)
	let brick = new Brick(new Vector3(0, 0, 0), new Vector3(player.brickSize,player.brickSize,player.brickSize), "#f54242")
	brick.visibility=0.5 //change to 0 later
	brick.collision=false
	brick.model=player.model
	player.buildcore=brick
	Game.newBrick(brick)
	brick.setInterval(() => {
		var rotx = Math.round(player.position.x + 8 * Math.sin(player.rotation.z / debug))
		var roty = Math.round(player.position.y - 8 * Math.cos(player.rotation.z / debug))
		if (player.brickcolor) brick.setColor(player.brickcolor)
		if (brick.position.x!==rotx || brick.position.y!==roty || brick.position.z!==Math.round(player.brickplacement+player.position.z)) {
			brick.setPosition(new Vector3(rotx -= Math.round(brick.scale.x /1.5) ,roty -= Math.round(brick.scale.x /1.5),Math.round(player.position.z+player.brickplacement)))
		}
		if (brick.rotation!==player.brickrot) {
			brick.setRotation(player.brickrot)
		}
		if (brick.scale.x!==player.brickSize) {
			brick.setScale(new Vector3(player.brickSize,player.brickSize,player.brickSize))
		}

		if (player.destroyed==true) {
			brickmodule.removebrick(player, brick, true)
		}
	}, 80)
}

Game.on("playerJoin", async(player) => {
	player.brickcolor="#f54242"
	player.model=0
	player.brickplacement = 0
	player.brickSize = 1
	player.brickrot=0
	player.bricks=[]
})

Game.on("initialSpawn", (player) => {
	createBuildCore(player)
	btools(player)
})

//oh no god please help me
function btools(p) {
	console.log("giving " + p.username + " btools")
	//create tool
	let create = new Tool("Create")
	create.model=20681
	create.on("activated", (p) => {
		let brick = brickmodule.newbrick(p, p.buildcore.position, p.brickSize, p.brickrot, p.brickcolor, p.model)
	})

	p.equipTool(create)

	//destroy tool
	let destroy = new Tool("Destroy")
	destroy.model=6928
	destroy.on("equipped", (p) => {
		world.bricks.forEach((brick) => {
			if (brick.placedBy) {
				brickmodule.sendClickable(true, brick, p)
			}
		})
	})
	destroy.on("unequipped", (p) => {
		world.bricks.forEach((brick) => {
			brickmodule.sendClickable(false, brick, p)
		})
	})
	p.equipTool(destroy)

	//size change tools
	let sizeInc = new Tool("Size+")
	sizeInc.model = 25568
	sizeInc.on("activated", p => {
		if (p.brickSize >= 5) {
			p.brickSize = 5
			return p.message(`[#00ff00][Size]: [#ffffff]You increased the brick size to ${p.brickSize}.`)
		}
		p.brickSize++
		p.message(`[#00ff00][Size]: [#ffffff]You increased the brick size to ${p.brickSize}.`)
	})
	p.equipTool(sizeInc)

	let sizeDec = new Tool("Size-")
	sizeDec.model = 87690
	sizeDec.on("activated", p => {
		if (p.brickSize <= 1) {
			p.brickSize = 1
			return p.message(`[#ff0000][Size]: [#ffffff]You decreased the brick size to ${p.brickSize}.`)
		}
		p.brickSize--
		p.message(`[#ff0000][Size]: [#ffffff]You decreased the brick size to ${p.brickSize}.`)
	})
	p.equipTool(sizeDec)


	//height tools
	let highInc = new Tool("Height+")
	highInc.model = 244
	highInc.on("activated", p => {
        	if (p.brickplacement >= 7) {
			p.brickplacement = 7
			return p.message(`[#00ff00][Height]: [#ffffff]You increased the brick placement height to ${p.brickplacement}.`)
		}
		p.brickplacement++
		p.message(`[#00ff00][Height]: [#ffffff]You increased the brick placement height to ${p.brickplacement}.`)
	})
	p.equipTool(highInc)

	let highDec = new Tool("Height-")
	highDec.model = 84038
	highDec.on("activated", p => {
		if (p.brickplacement <= -7) {
			p.brickplacement = -7
			return p.message(`[#ff0000][Height]: [#ffffff]You decreased the brick placement height to ${p.brickplacement}.`)
		}
		p.brickplacement--
		p.message(`[#ff0000][Height]: [#ffffff]You decreased the brick placement height to ${p.brickplacement}.`)
	})
	p.equipTool(highDec)


	//rotate tool
	let Rotate = new Tool("Rotate")
	Rotate.model=105456
	Rotate.on("activated", p => {
		p.brickrot+=90
		if (p.brickrot>=360) p.brickrot-=360
		p.message(`[#00ffff][Rotate]: [#ffffff]You changed the brick rotation to ${p.brickrot}.`)
	})
	p.equipTool(Rotate)
}

