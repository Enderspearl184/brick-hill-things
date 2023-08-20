// BBTools by SmartLion, but slightly modified
// Partial code from cheats' admin
// Used for new btools for cheats' admin

// SemVer 0.0.1?

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

function btools(player) {

    let create = new Tool("Create")
    create.model = 20681
    create.on("activated", p => {
        var rotx = Math.round(p.position.x + 8 * Math.sin(p.rotation.z / debug))
        var roty = Math.round(p.position.y - 8 * Math.cos(p.rotation.z / debug))
        let brick = new Brick(new Vector3(rotx -= Math.round(p.brickSize /1.5) ,roty -= Math.round(p.brickSize /1.5) ,Math.round(p.position.z+p.brickplacement)),new Vector3(p.brickSize,p.brickSize,p.brickSize),p.brickcolor)
        brick.name = "btools"
	brick.setClickable(true, 100000)
        Game.newBrick(brick)
	console.log(p.username + " placed a brick")
	sendClickable(false, brick, p)
	brick.clicked(debounce((p) => {
    		if (p.toolEquipped==destroy) {
			console.log(p.username, "destroyed a brick")
		 	brick.destroy()
		 }
	}), 500)
    })
    
    let destroy = new Tool("Destroy")
    destroy.model = 6928

    destroy.on("equipped", p => {
	console.log(p.username + " equipped the delete tool")
        for (let bricks of world.bricks) {
	    setTimeout(function(){
		if (bricks.name==="btools") {
			sendClickable(true, bricks, p)
		}
	    }, 5)
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
    
    player.addTool(create)
    player.addTool(destroy)
    player.addTool(sizeInc)
    player.addTool(sizeDec)
    player.addTool(highInc)
    player.addTool(highDec)
}


Game.on("playerJoin", (player) => {
    player.brickcolor = "#f54242"
    player.brickplacement = 0
    player.brickSize = 1
    player.on("initialSpawn", () => {
        btools(player)
        let brick = new Brick(new Vector3(0, 0, 0), new Vector3(1, 1, 1), "#f54242")
        brick.setVisibility(0.5)
        brick.setCollision(false) //HOWHOOHOWHOHOWHOHWOHWO
        Game.newBrick(brick)
        brick.name = "buildingcore"
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

Game.command("paint", (p, msg) => {
    p.brickcolor = `#${msg}` //too simple or,
})