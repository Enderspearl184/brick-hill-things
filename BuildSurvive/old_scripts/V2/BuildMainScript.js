var brickmodule = require("./add_remove_brick.js") //module that deals with a lot of spaghetti code so i didn't copy it everywhere

const MaxPlates = 9
const MaxBricks = 1000

const brickTShirt=147324
const modelTShirt=167241

//tools now at the TOP of the script because it was creating new tool instances everytime someone joined which would eventually out of memory the server...
//create tool
let create = new Tool("Create")
create.model=20681
create.on("activated", (p) => {
	//console.log("tool activated")
	if (p.bricks.length>=p.maxBricks) {
		p.message("You have reached the maximum bricks.")
		if (!p.ownsTShirt) p.message("Buy the T-Shirt of Game Breaking if you want to double your brick limit.")
	} else {
		let brick = brickmodule.newbrick(p, p.buildcore.position, p.brickSize, p.brickrot, p.brickcolor, p.model,p.visibility)
		p.bottomPrint("Bricks Placed: " + p.bricks.length + "/" + p.maxBricks)
	}
})

//destroy tool
let destroy = new Tool("Destroy")
destroy.model=6928
destroy.on("equipped", (p) => {
	world.bricks.forEach((brick) => {
		if (brick.placedBy==p.userId) { //send that bricks *they* placed are clickable
			brickmodule.sendClickable(true, brick, p)
		}
	})
})
destroy.on("unequipped", (p) => {
	world.bricks.forEach((brick) => {
		if (brick.placedBy==p.userId) { //make those bricks not appear clickable anymore
			brickmodule.sendClickable(false, brick, p)
		}
	})
})

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


//height tools
let highInc = new Tool("Height+")
highInc.model = 244
highInc.on("activated", p => {
       	if (p.brickplacement >= 10) {
		p.brickplacement = 10
		return p.message(`[#00ff00][Height]: [#ffffff]You increased the brick placement height to ${p.brickplacement}.`)
	}
	p.brickplacement++
	p.message(`[#00ff00][Height]: [#ffffff]You increased the brick placement height to ${p.brickplacement}.`)
})

let highDec = new Tool("Height-")
highDec.model = 84038
highDec.on("activated", p => {
	if (p.brickplacement <= -10) {
		p.brickplacement = -10
		return p.message(`[#ff0000][Height]: [#ffffff]You decreased the brick placement height to ${p.brickplacement}.`)
	}
	p.brickplacement--
	p.message(`[#ff0000][Height]: [#ffffff]You decreased the brick placement height to ${p.brickplacement}.`)
})


//rotate tool
let Rotate = new Tool("Rotate")
Rotate.model=105456
Rotate.on("activated", p => {
	p.brickrot+=90
	if (p.brickrot>=360) p.brickrot-=360
	p.message(`[#00ffff][Rotate]: [#ffffff]You changed the brick rotation to ${p.brickrot}.`)
})


const Plates={
	1: {
		plate: world.bricks.find((b)=>b.name=="Plate1"),
		open: true
	},
	2: {
		plate: world.bricks.find((b)=>b.name=="Plate2"),
		open: true
	},
	3: {
		plate: world.bricks.find((b)=>b.name=="Plate3"),
		open: true
	},
	4: {
		plate: world.bricks.find((b)=>b.name=="Plate4"),
		open: true
	},
	5: {
		plate: world.bricks.find((b)=>b.name=="Plate5"),
		open: true
	},
	6: {
		plate: world.bricks.find((b)=>b.name=="Plate6"),
		open: true
	},
	7: {
		plate: world.bricks.find((b)=>b.name=="Plate7"),
		open: true
	},
	8: {
		plate: world.bricks.find((b)=>b.name=="Plate8"),
		open: true
	},
	9: {
		plate:world.bricks.find((b)=>b.name=="Plate9"),
		open:true
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
	p.kick("Too many players! This set only supports up to " + MaxPlates + " players at once right now!")
}

function setPlate(p, plate) {
	console.log("plate " + plate + " is open")
	Plates[plate].open = false
	p.plate = Plates[plate]
}

function createBuildCore(player) {
	if (player.buildcore) { //we remove the buildcore if it already exists as this function creates another
		brickmodule.removebrick(player, player.buildcore, true)
	}
	console.log("creating buildcore for :" + player.username) //debug stuff
	let brick = new Brick(new Vector3(0, 0, 0), new Vector3(player.brickSize,player.brickSize,player.brickSize), "#f54242")
	brick.visibility=0
	brick.collision=false
	brick.model=player.model
	player.buildcore=brick
	Game.newBrick(brick)
	brick.setInterval(() => {
		var rotx = Math.round(player.position.x + 8 * Math.sin(player.rotation.z / debug)) //basically directly taken from the bbtools script
		var roty = Math.round(player.position.y - 8 * Math.cos(player.rotation.z / debug))
		if (player.brickcolor) brick.setColor(player.brickcolor)
		if (brick.position.x!==rotx || brick.position.y!==roty || brick.position.z!==Math.round(player.brickplacement+player.position.z)) {
			brick.setPosition(new Vector3(rotx -= Math.round(brick.scale.x /1.5) ,roty -= Math.round(brick.scale.x /1.5),Math.round(player.position.z+player.brickplacement)))
		}
		if (brick.rotation!==player.brickrot) { //rotation, apparently this causes client crashes for some reason and I don't know why in particular.
			brick.setRotation(player.brickrot)
		}
		if (brick.scale.x!==player.brickSize) { //scale
			brick.setScale(new Vector3(player.brickSize,player.brickSize,player.brickSize))
		}

		if (brick.model!==player.model && !isNaN(player.model) && player.model!==0) { //because resetting the model aint a feature as of making this, i have to do this garbage to create a new buildcore
			brick.setModel(player.model)
		} else if (brick.model!==0 && (player.model==0 || isNaN(player.model))) {
			brick.model=0
			player.model=0
			createBuildCore(player)
		}
		
		if (player.toolEquipped && player.toolEquipped!==destroy && brick.visibility==0) { //localbrick visibility shit
			brick.setVisibility(0.5)
		} else if ((!player.toolEquipped || player.toolEquipped==destroy) && brick.visibility==0.5) {
			brick.setVisibility(0)
		}

		if (player.destroyed==true) { //remove buildcore if the player leaves
			brickmodule.removebrick(player, brick, true)
		}
	}, 80)
}

Game.on("playerJoin", async(player) => {
	getAvailablePlate(player) //set up the plate and other properties for placed bricks.
	player.brickcolor="#f54242"
	player.model=0
	player.brickplacement = 0
	player.brickSize = 1
	player.brickrot=0
	player.visibility=1
	player.bricks=[]
	player.corner1=player.plate.plate.position
	player.corner2=new Vector3(player.plate.plate.position.x+player.plate.plate.scale.x-1, player.plate.plate.position.y+player.plate.plate.scale.y-1, 0)
	//t shirt stuff
	player.ownsTShirt=await player.ownsAsset(brickTShirt)
	player.ownsModelTShirt=await player.ownsAsset(modelTShirt)

	if (player.ownsTShirt || Game.local) {
		player.maxBricks=MaxBricks*2
	} else player.maxBricks=MaxBricks

	//give admins infinite bricks to use :)
	if (player.admin) {
		player.maxBricks=Infinity
	}
	console.log(player.ownsTShirt)
	console.log(player.ownsModelTShirt)
	player.on("respawn", () => { //teleport them to the center of their plate on respawn
		player.setPosition(new Vector3(player.corner1.x+25,player.corner1.y+25,0)) //teleport them to the center of their plate
	})
	
})

Game.on("initialSpawn", (player) => {
	player.setPosition(new Vector3(player.corner1.x+25,player.corner1.y+25,0)) //teleport them to the center of their plate
	createBuildCore(player) //make the buildcore for them!
	btools(player) //give them btools
	//fix for already placed bricks appearing clickable!
	world.bricks.forEach((brick) => {
		brickmodule.sendClickable(false, brick, player)
	})
})

//oh no god please help me
function btools(p) {
	console.log("giving " + p.username + " btools")
	p.equipTool(create)
	p.equipTool(destroy)
	p.equipTool(sizeInc)
	p.equipTool(sizeDec)
	p.equipTool(highInc)
	p.equipTool(highDec)
	p.equipTool(Rotate)
}

Game.on("playerLeave", (p) => {
	clearPlot(p) //clear plot on leaving and mark the plot as open
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
			await sleep(100)
			brickmodule.removebrick(player, brick, true) //yes this removes them all individually. no i don't care.
		}
	})
}
