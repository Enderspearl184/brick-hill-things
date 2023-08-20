var brickmodule = require("./add_remove_brick.js")

const MaxPlates = 8
const MaxBricks = 500

const Plates={
	1: {
		corner1: new Vector3(75, 75, 0),
		corner2: new Vector3(124, 124, 0),
		open: true
	},
	2: {
		corner1: new Vector3(-125, 75, 0),
		corner2: new Vector3(-76, 124, 0),
		open: true
	},
	3: {
		corner1: new Vector3(-125, -125, 0),
		corner2: new Vector3(-76, -76, 0),
		open: true
	},
	4: {
		corner1: new Vector3(75, -125, 0),
		corner2: new Vector3(124, -76, 0),
		open: true
	},
	5: {
		corner1: new Vector3(10, 10, 0),
		corner2: new Vector3(59, 59, 0),
		open: true
	},
	6: {
		corner1: new Vector3(10, -60, 0),
		corner2: new Vector3(59, -11, 0),
		open: true
	},
	7: {
		corner1: new Vector3(-60, 10, 0),
		corner2: new Vector3(-11, 59, 0),
		open: true
	},
	8: {
		corner1: new Vector3(-60, -60, 0),
		corner2: new Vector3(-11, -11, 0),
		open: true
	}
}

let debug = -57.7

//sets correct plate or kicks if none are open
function getAvailablePlate(p) {
	for (i=1; i<=MaxPlates; i++) {
		if (Plates[i].open) {
			return setPlate(p, i)
		}
	}
	console.log("none open")
	p.kick("Too many players! This set only supports up to " + MaxPlates + " players at once right now, but more will be supported soon!")
}

function setPlate(p, plate) {
	console.log("plate " + plate + " is open")
	Plates[plate].open = false
	p.plate = Plates[plate]
}

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

		if (brick.model!==player.model && !isNaN(player.model)) {
			brick.setModel(player.model)
		} else if (brick.model!==0 && (player.model==0 || isNaN(player.model))) {
			brick.model=0
			player.model=0
			createBuildCore(player)
		}

		if (player.destroyed==true) {
			brickmodule.removebrick(player, brick, true)
		}
	}, 80)
}

Game.on("playerJoin", async(player) => {
	getAvailablePlate(player)
	player.brickcolor="#f54242"
	player.model=0
	player.brickplacement = 0
	player.brickSize = 1
	player.brickrot=0
	player.bricks=[]
	player.ownsTShirt=await player.ownsAsset(147324)
	player.ownsModelTShirt=await player.ownsAsset(167241)
	if (player.ownsTShirt || Game.local) {
		player.maxBricks=MaxBricks*2
	} else player.maxBricks=MaxBricks
	console.log(player.ownsTShirt)
	console.log(player.ownsModelTShirt)
	player.on("respawn", () => {
		player.setPosition(new Vector3(player.plate.corner1.x+25,player.plate.corner1.y+25,0))
	})
	
})

Game.on("initialSpawn", (player) => {
	player.setPosition(new Vector3(player.plate.corner1.x+25,player.plate.corner1.y+25,0))
	createBuildCore(player)
	btools(player)
	setTimeout(function() {
		let tool = player.inventory.find((tool) => tool.name=="Create")
		tool.emit("activated", player)
	}, 1000)
	setTimeout(function() {
		Game.emit("command", "clear", player)
	}, 1500)
})

//oh no god please help me
function btools(p) {
	console.log("giving " + p.username + " btools")
	//create tool
	let create = new Tool("Create")
	create.model=20681
	create.on("activated", (p) => {
		//console.log("tool activated")
		if (p.bricks.length>=p.maxBricks) {
			p.message("You have reached the maximum bricks.")
			if (!p.ownsTShirt) p.message("Buy the T-Shirt of Game Breaking if you want to double your brick limit.")
		} else {
			let brick = brickmodule.newbrick(p, p.buildcore.position, p.brickSize, p.brickrot, p.brickcolor, p.model)
			p.topPrint("Bricks Placed: " + p.bricks.length + "/" + p.maxBricks)
		}
	})

	p.equipTool(create)

	//destroy tool
	let destroy = new Tool("Destroy")
	destroy.model=6928
	destroy.on("equipped", (p) => {
		world.bricks.forEach((brick) => {
			if (brick.placedBy==p.userId) {
				brickmodule.sendClickable(true, brick, p)
			}
		})
	})
	destroy.on("unequipped", (p) => {
		world.bricks.forEach((brick) => {
			if (brick.placedBy==p.userId) {
				brickmodule.sendClickable(false, brick, p)
			}
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

Game.on("playerLeave", (p) => {
	clearPlot(p)
	if (p.plate) {
		p.plate.open=true
	}
})

Game.command("clear", (p) => {
	clearPlot(p)
})

function clearPlot(player) {
	console.log("clearing plot of : " + player.username)
	world.bricks.forEach(async(brick) => {
		if (brick.placedBy==player.userId) {
			brickmodule.removebrick(player, brick, true)
		}
	})
}
