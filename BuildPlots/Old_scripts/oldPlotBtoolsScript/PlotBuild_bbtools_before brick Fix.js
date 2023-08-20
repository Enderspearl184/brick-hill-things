// BBTools by SmartLion
// Partial code from cheats' admin
// Used for new btools for cheats' admin

// SemVer 0.0.1?

const MaxPlates = 8

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



Game.on("playerJoin", (player) => {
    getAvailablePlate(player)
    player.PlacedBrickCount = 0
    player.bricks = []
    player.brickcolor = "#f54242"
    player.brickplacement = 0
    player.brickSize = 1
    player.brickrot=0
    player.model=0
    player.on("initialSpawn", async() => {
		if (await player.ownsAsset(147324)) player.ownsTShirt=true
		if (await player.ownsAsset(167241)) player.ownsModelTShirt=true
		btools(player)
		player.setPosition(new Vector3(player.plate.corner1.x+25,player.plate.corner1.y+25,0))
		let brick = new Brick(new Vector3(0, 0, 0), new Vector3(1, 1, 1), "#f54242")
		brick.visibility=0
		brick.collision=false //HOWHOOHOWHOHOWHOHWOHWO
		Game.newBrick(brick)
		brick.name = "buildingcore"
		player.buildcore = brick
		brick.setInterval(async() => {
			var rotx = Math.round(player.position.x + 8 * Math.sin(player.rotation.z / debug))
			var roty = Math.round(player.position.y - 8 * Math.cos(player.rotation.z / debug))
			brick.setColor(player.brickcolor)
			brick.setPosition(new Vector3(rotx -= Math.round(brick.scale.x /1.5) ,roty -= Math.round(brick.scale.x /1.5),Math.round(player.position.z+player.brickplacement)))
			brick.setScale(new Vector3(player.brickSize,player.brickSize,player.brickSize))
			brick.setRotation(player.brickrot)
			if (!isNaN(player.model) ) {
				brick.setModel(player.model)
			} else if (brick.model!==0) {
				await destroyBrick(brick)
				brick.model=0
				Game.newBrick(brick)
			}
			if (player.destroyed == true) {
				destroyBrick(brick)
			}
		}, 80);
    })

	player.on("respawn", () => {
		player.setPosition(new Vector3(player.plate.corner1.x+25,player.plate.corner1.y+25,0))
	})
 })

//replace it here later

Game.on("playerLeave", (player) => {
	destroyBrick(false, player)
	if (player.plate) return player.plate.open=true
})

Game.command("paint", (p, msg) => {
    p.brickcolor = `#${msg}` //too simple or,
})

Game.command("model", (p,id) => {
	if (p.ownsModelTShirt!==true && Game.local==false) {
		p.message("You need the /model T-Shirt to use this.")
		p.message("You can find the T-Shirt in the description")
		return
	}
	return p.model=parseInt(id)
})

Game.command("clear", (player) => {
	player.message("Clearing bricks...")
	let removedBricks = destroyBrick(false, player)
	player.PlacedBrickCount=player.bricks.length
	player.bricks=[]
})

Game.command("save", async (p) => {
	p.message("Saving data... This will take a little, to prevent errors from messing with your build.")
	let SaveBricks=[]
	for (let bricks of p.bricks) {
		if (bricks.placedby==p.username && !bricks.destroyed) {

			//not using the brick directly for the save, but instead an object and setting the main properties to the brick's. add more when necessary
			let BrickSave = {}
			BrickSave.position= await new Vector3(bricks.position.x-(p.plate.corner2.x),bricks.position.y-(p.plate.corner2.y),bricks.position.z)
			BrickSave.scale=await bricks.scale
			BrickSave.color=await bricks.color
			BrickSave.posRecover = await p.plate.corner2
			BrickSave.model=await bricks.model
			BrickSave.rotation=await bricks.rotation

			//wait a little to prevent the player's build from getting messed up.
			await sleep(5)

			SaveBricks.push(BrickSave)
		}
	}
	writeData(p, SaveBricks, 1)
	for (let bricks of SaveBricks) {
		bricks.position=new Vector3(bricks.position.x+(p.plate.corner2.x),bricks.position.y+(p.plate.corner2.y),bricks.position.z)
	}
})

Game.command("load", async(p, id) => {
	p.PlacedBrickCount=0
	
	if (id!=="load") {
		if (p.userId==305122 || Game.local) {
			readData(p, id,1)
		}
	} else readData(p, p.userId, 1)
})

Game.command("help", (p) => {
	p.message("======= Commands =======")
	p.message("/save - save your current build.")
	p.message("/load - load your saved build.")
	p.message("/paint (hex colour code) - change the colour of new bricks.")
	p.message("/reset - respawn yourself.")
	p.message("/model (asset id) - change the model of new bricks. If asset id is not specified, then the model is reset.")
	p.message("========================")
})

function btools(player) {

	console.log("giving " + player.username + " btools")
	let create = new Tool("Create")
	create.model = 20681
	player.create=create
	create.on("equipped", p => {
		p.buildcore.setVisibility(0.5)
	})

	create.on("unequipped", p => {	
		p.buildcore.setVisibility(0)
	})

	create.on("activated", p => {
		var rotx = Math.round(p.position.x + 8 * Math.sin(p.rotation.z / debug))
		var roty = Math.round(p.position.y - 8 * Math.cos(p.rotation.z / debug))
		let brick = new Brick(new Vector3(rotx -= Math.round(p.brickSize /1.5) ,roty -= Math.round(p.brickSize /1.5) ,Math.round(p.position.z+p.brickplacement)),new Vector3(p.brickSize,p.brickSize,p.brickSize),p.brickcolor)
		if (!isInBounds(p, brick)) {
			p.message("The brick isn't on your plot. do /reset if you forgot which plot is yours.")
			return brick.destroy()
		}
			
		//if playerbrickcount is less than 0 prompt them to message me.
		if (p.PlacedBrickCount<0) {
			p.prompt("PlacedBrickCount is less than 0. Message Enderspearl184 with details on what you did to cause this.")
			p.PlacedBrickCount=p.bricks.length
		}

		//check for max build limit, but if they have the nothing t shirt, then instead check for the 1000 max.
		if (p.PlacedBrickCount >= 500 && p.userId!==305122 && !Game.local && !p.ownsTShirt) {
			brick.destroy()
			return p.message("You have reached the max brick count. Use the destroy tool, or do /clear to clear them!")
		}
		if (p.PlacedBrickCount >= 1000 && p.userId!==305122 && !Game.local && p.ownsTShirt) {
			brick.destroy()
			return p.message("You have reached the max brick count. Use the destroy tool, or do /clear to clear them!")
		}

		brick.name = "btools"
		brick.placedby = p.username
		brick.model=p.model
		brick.rotation=p.brickrot
		p.bricks.push(brick)
		p.PlacedBrickCount=p.bricks.length
	
		//print bricks used, but make it /1000 for people with the nothing t shirt
		if (!p.ownsTShirt && !Game.local) p.topPrint(p.PlacedBrickCount + "/500 bricks placed.", 7)
		if (p.ownsTShirt || Game.local) p.topPrint(p.PlacedBrickCount + "/1000 bricks placed", 7)

		Game.newBrick(brick)
		sendClickable(false, brick, p)
		Game.newBrick(brick)

		brick.clicked(debounce((p) => {
				brickClick(p, brick)
		}), 500)
    })
    
	let destroy = new Tool("Destroy")
	destroy.model = 6928
	player.destroytool=destroy

	destroy.on("equipped", p => {
		console.log(p.username + " equipped the delete tool")
			for (let bricks of p.bricks) {
				if (bricks.name==="btools" && bricks.placedby==p.username) {
					sendClickable(true, bricks, p)
				}
			}
	})

	destroy.on("unequipped", p => {
		console.log(p.username + " unequipped the delete tool")
			for (let bricks of world.bricks) {
				if (bricks.name==="btools") {
					sendClickable(false, bricks, p)
				}
		}
	})
    

    let sizeInc = new Tool("Size+")
    sizeInc.model = 25568
    player.sizeInc=sizeInc
    sizeInc.on("equipped", p => {
	p.buildcore.setVisibility(0.5)
    })

    sizeInc.on("unequipped", p => {	
	p.buildcore.setVisibility(0)
    })
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
    player.sizeDec=sizeDec
    sizeDec.on("equipped", p => {
	p.buildcore.setVisibility(0.5)
    })

    sizeDec.on("unequipped", p => {	
	p.buildcore.setVisibility(0)
    })
    sizeDec.on("activated", p => {
        if (p.brickSize <= 1) {
            p.brickSize = 1
            return p.message(`[#ff0000][Size]: [#ffffff]You decreased the brick size to ${p.brickSize}.`)
        }
            p.brickSize--
            p.message(`[#ff0000][Size]: [#ffffff]You decreased the brick size to ${p.brickSize}.`)
    })

    let highInc = new Tool("Height+")
    highInc.model = 244
    player.highInc=highInc
    highInc.on("equipped", p => {
	p.buildcore.setVisibility(0.5)
    })

    highInc.on("unequipped", p => {	
	p.buildcore.setVisibility(0)
    })
    highInc.on("activated", p => {
        if (p.brickplacement >= 7) {
            p.brickplacement = 7
            return p.message(`[#00ff00][Height]: [#ffffff]You increased the brick placement height to ${p.brickplacement}.`)
        }
        p.brickplacement++
        p.message(`[#00ff00][Height]: [#ffffff]You increased the brick placement height to ${p.brickplacement}.`)
    })

    let highDec = new Tool("Height-")
    highDec.model = 84038
    player.highDec=highDec
    highDec.on("equipped", p => {
	p.buildcore.setVisibility(0.5)
    })

    highDec.on("unequipped", p => {	
	p.buildcore.setVisibility(0)
    })
    highDec.on("activated", p => {
        if (p.brickplacement <= -7) {
            p.brickplacement = -7
            return p.message(`[#ff0000][Height]: [#ffffff]You decreased the brick placement height to ${p.brickplacement}.`)
        }
            p.brickplacement--
            p.message(`[#ff0000][Height]: [#ffffff]You decreased the brick placement height to ${p.brickplacement}.`)
    })

    let Rotate = new Tool("Rotate")
    Rotate.model=105456
    player.Rotate=Rotate
    Rotate.on("equipped", p => {
	p.buildcore.setVisibility(0.5)
    })

    Rotate.on("unequipped", p => {	
	p.buildcore.setVisibility(0)
    })
    Rotate.on("activated", p => {
	p.brickrot+=90
	if (p.brickrot>=360) p.brickrot-=360
    })
    
    player.addTool(create)
    player.addTool(destroy)
    player.addTool(sizeInc)
    player.addTool(sizeDec)
    player.addTool(highInc)
    player.addTool(highDec)
    player.addTool(Rotate)
}

function writeData(p, data, slot) {
	//save data to "userid_slot1.sav" slots will be added sometime...
	fs.writeFile(`./playerData/${p.userId}_slot${slot}.sav`,JSON.stringify(data), function (err) {
		if (err) throw err;
		console.log('Data Saved!');
		p.message("Data Saved!")
	});
}

function readData(p, userId, slot) {
	//read data file for user, with slot (to be used later)
	fs.readFile(`./playerData/${userId}_slot${slot}.sav`, async function(err, data) {
		if (data==undefined) return p.message("No save data found. Your build has not been cleared.")

		//places a brick to prevent collision because that somehow prevents it?

		let brick = new Brick(new Vector3(p.plate.corner2.x ,p.plate.corner2.y ,p.plate.corner2.z),new Vector3(1,1,1), "#ff0000")
		brick.name = "btools"
		brick.placedby = p.username
		p.bricks.push(brick)
		p.PlacedBrickCount=p.bricks.length
		Game.newBrick(brick)
		sendClickable(false, brick, p)
		Game.newBrick(brick)
		brick.clicked(debounce((p) => {
    			brickClick(p, brick)
		}), 500)

		await sleep(125)

		p.message("Clearing your bricks to replace with your saved build!")
		let deletebricks = await destroyBrick(false, p)
		p.message("Finished clearing the plot.")

		let LoadBricks = JSON.parse(data)
		console.log("Loading the data of " + p.username)
		p.message("Loading your Saved Data.")
	
		for (let bricks of LoadBricks) {
		//put bricks in game and add them, if they are in bounds.
			let brick = new Brick()
		
			//saves the new brick's netid (not used for new saves, but older ones may need this line)
			let safeNetId = brick.netId


			Object.assign(brick, bricks)
			brick.placedby=p.username
			brick.name="btools"
			
			//if the save is new this doesn't do anything because the two values will be the same.
			brick.netId=safeNetId
			
			brick.position=new Vector3(brick.position.x+(p.plate.corner2.x),brick.position.y+(p.plate.corner2.y),brick.position.z)
	
			if (isInBounds(p, brick)) {
				p.bricks.push(brick)
				p.PlacedBrickCount=p.bricks.length
				
				//if brick can be placed wait 20ms to prevent lag
				await sleep(20)

				Game.newBrick(brick)
				sendClickable(false, brick, p)
				Game.newBrick(brick)
			} else {
				brick.destroy()
				p.erroroccured=true
			}
			if (!p.ownsTShirt && !Game.local) p.topPrint(p.PlacedBrickCount + "/500 bricks placed.", 7)
			if (p.ownsTShirt || Game.local) p.topPrint(p.PlacedBrickCount + "/1000 bricks placed", 7)

			//let them be removed with clicking like normal
			brick.clicked(debounce((p) => {
    				brickClick(p, brick)
			}), 500)
		}
		if (p.erroroccured) {
			p.message("Loaded save data. Some bricks were outside of the plot and weren't placed.")
			p.message("If your build is missing, message Enderspearl184(tag)1841 on Discord,")
			p.message("and don't save over it until you get a response from me.")
			p.message("I'll probably be able to recover your build for you, if it hasn't been saved over.")
			return p.erroroccured=false
		}
		return p.message("Finished loading saved data. Equip and unequip the delete tool if blocks show the clickable icon.")
	});
}

function brickClick(p, brick) {
    if (p.toolEquipped==p.destroytool && brick.placedby==p.username && !brick.destroying) {
		sendClickable(false, brick, p)
		brick.destroying=true

		//if PlacedBrickCount is less than 0 promp them to message me again.
		if (p.PlacedBrickCount<0) {
			p.prompt("PlacedBrickCount is less than 0. Message Enderspearl184 with details on what you did to cause this.")
			p.PlacedBrickCount=p.bricks.length
		}

		destroyBrick(brick)
		p.bricks.splice(p.bricks.indexOf(brick), 1)
		p.placedBrickCount=p.bricks.length
		if (!p.ownsTShirt && Game.local==false) p.topPrint(p.PlacedBrickCount + "/500 bricks placed.", 7)
		if (p.ownsTShirt || Game.local) p.topPrint(p.PlacedBrickCount + "/1000 bricks placed", 7)
	}
}

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

async function sendClickable(canClick, brick, p) {
	await sleep(100)
	
	let brickPacket = new PacketBuilder("Brick")
	.write("uint32", brick.netId)
	.write("string", "clickable")
	.write("bool", canClick)
	.write("uint32", 1000000)
	brickPacket.send(p.socket)
}

async function destroyBrick(brick, player, all, caller) {
	let deletebricks = []
	if (brick) {
		deletebricks.push(brick)
	}
	if (player) {
		for (let arraybricks of world.bricks) {
			if (arraybricks.placedby==player.username) {
				deletebricks.push(arraybricks)
				player.bricks.splice(player.bricks.indexOf(arraybricks), 1)
				player.PlacedBrickCount=player.bricks.length
			}
		}
	}

	if (all) {
		for (let allbricks of world.bricks) {
			if (allbricks.name=="btools") {
				deletebricks.push(allbricks)
			}
		}
	}
	
	let brickcount = await deletebricks.length

	for (let deletethese of deletebricks) {

		await sleep(10)

		let bricks = []
		deletethese.setCollision(false)
		bricks.push(deletethese)
		Game.deleteBricks(bricks)
		brickcount-=1
	}
}

function isInBounds(p, brick) {
	if (brick.position.x < p.plate.corner1.x || brick.position.x > p.plate.corner2.x || brick.position.y < p.plate.corner1.y || brick.position.y > p.plate.corner2.y) return false
	if (brick.position.x+brick.scale.x-1 < p.plate.corner1.x || brick.position.x+brick.scale.y-1 > p.plate.corner2.x || brick.position.y+brick.scale.y-1 < p.plate.corner1.y || brick.position.y+brick.scale.y-1 > p.plate.corner2.y) return false
	return true
}