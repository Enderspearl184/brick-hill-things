// BBTools by SmartLion
// Partial code from cheats' admin
// Used for new btools for cheats' admin

// SemVer 0.0.1?

const buildZoneXY = -116
const buildZoneZ = 0
const buildZoneXY2 = -44
const buildZoneZ2 = 100

let debug = -57.7
const BroadCastExcept = []

async function sendClickable(canClick, brick, p) {
	await sleep(100)
	
	let brickPacket = new PacketBuilder("Brick")
	.write("uint32", brick.netId)
	.write("string", "clickable")
	.write("bool", canClick)
	.write("uint32", 1000000)
	brickPacket.send(p.socket)
}

async function destroyBrick(brick, player, all) {
	let deletebricks = []
	if (brick) {
		deletebricks.push(brick)
	}
	if (player) {
		for (let arraybricks of player.bricks) {
			deletebricks.push(arraybricks)
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
	console.log(brickcount)

	for (let deletethese of deletebricks) {
			await sleep(50)
			deletethese.setVisibility(0.5)
	}
	await sleep(10)
	console.log("deleting bricks now")
	return Game.deleteBricks(deletebricks)
}

function btools(player) {
	
	if (player.btools) {
		player.buildcore.setVisibility(0)
		player.destroyTool(player.create)
		player.destroyTool(player.destroytool)
		player.destroyTool(player.sizeInc)
		player.destroyTool(player.sizeDec)
		player.destroyTool(player.highInc)
		player.destroyTool(player.highDec)
		player.btools=false
		return
	}


    player.btools=true
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
	if (brick.position.x < buildZoneXY || brick.position.x > buildZoneXY2 || brick.position.y < buildZoneXY || brick.position.y > buildZoneXY2 || brick.position.z < buildZoneZ || brick.position.z > buildZoneZ2) return brick.destroy()
	if (Math.round(brick.position.x+brick.scale.x-1) < buildZoneXY || Math.round(brick.position.x+brick.scale.x-1) > buildZoneXY2 || Math.round(brick.position.y+brick.scale.y-1) < buildZoneXY || Math.round(brick.position.y+brick.scale.y-1) > buildZoneXY2 || Math.round(brick.position.z+brick.scale.z-1) < buildZoneZ || Math.round(brick.position.y+brick.scale.y-1) > buildZoneZ2) return brick.destroy()
	if (p.PlacedBrickCount >= 50) {
		brick.destroy()
		return p.message("You have reached the max brick count. do /clearmybricks to clear them!")
	}
        brick.name = "btools"
	brick.placedby = p.username
	p.bricks.push(brick)
	brick.setClickable(true, 100000)
	brick.collision=true
        Game.newBrick(brick)
	p.PlacedBrickCount+=1
	console.log(p.username + " placed a brick")

	for (let players of Game.players) {
		sendClickable(false, brick, players)
	}

	brick.clicked(debounce((p) => {
    		if (p.toolEquipped==destroy && brick.placedby==p.username) {
			p.PlacedBrickCount-=1
			p.bricks.splice(p.bricks.indexOf(brick), 1)
		 	destroyBrick(brick)
		 }
	}), 500)
    })
    
    let destroy = new Tool("Destroy")
    destroy.model = 6928
    player.destroytool=destroy

    destroy.on("equipped", p => {
	console.log(p.username + " equipped the delete tool")
        for (let bricks of world.bricks) {
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
    
    player.addTool(create)
    player.addTool(destroy)
    player.addTool(sizeInc)
    player.addTool(sizeDec)
    player.addTool(highInc)
    player.addTool(highDec)
}


Game.on("playerJoin", (player) => {
    player.PlacedBrickCount = 0
    player.bricks = []
    player.brickcolor = "#f54242"
    player.brickplacement = 0
    player.brickSize = 1
    player.on("initialSpawn", () => {
        let brick = new Brick(new Vector3(0, 0, 0), new Vector3(1, 1, 1), "#f54242")
        brick.visibility=0
        brick.collision=false //HOWHOOHOWHOHOWHOHWOHWO
        Game.newBrick(brick)
        brick.name = "buildingcore"
	player.buildcore = brick
        brick.setInterval(() => {
            var rotx = Math.round(player.position.x + 8 * Math.sin(player.rotation.z / debug))
            var roty = Math.round(player.position.y - 8 * Math.cos(player.rotation.z / debug))
            brick.setColor(player.brickcolor)
            brick.setPosition(new Vector3(rotx -= Math.round(brick.scale.x /1.5) ,roty -= Math.round(brick.scale.x /1.5),Math.round(player.position.z+player.brickplacement)))
            brick.setScale(new Vector3(player.brickSize,player.brickSize,player.brickSize))
            if (player.destroyed == true) {
                brick.destroy()
            }
        }, 80);
    })
 })

Game.on("playerLeave", (player) => {
	destroyBrick(false, player)
})

Game.command("paint", (p, msg) => {
    p.brickcolor = `#${msg}` //too simple or,
})

Game.command("clearmybricks", (player) => {
	destroyBrick(false, player)
	player.PlacedBrickCount=0
	player.bricks=[]
})

Game.command("clearall", (player) => {
	if (player.userId==305122  || Game.local) {
		destroyBrick(false, false, true)
		for (let players of Game.players) {
			players.PlacedBrickCount=0
			players.bricks=[]
		}
	}
})

Game.command("btools", (p) => {
	btools(p)
	if (p.btools) return ("giving " + p.username + " btools.")
	console.log("removing btools from " + p.username + ".")
})