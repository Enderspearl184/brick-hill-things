let debug = -57.7
const fs = getModule('fs')
const magickey = new Tool("Magic Key")
const keypath='./data/magic_key_owners.json'
var magickeyholders=JSON.parse(fs.readFileSync(keypath))
Game.magickey = magickey
magickey.model=427
magickey.on("activated", async(p) => {
	dashplr(p)
})

//gives speed and jump boost
magickey.on("equipped", async(p) => {
	p.setSpeed(20)
	p.setJumpPower(15)
})

//removes said speed and jump boost
magickey.on("unequipped", async(p) => {
	p.setSpeed(6)
	p.setJumpPower(5)
})

Game.command("key", (p, v) => {
	const keyer = getPlayer(v)
	keyer.equipTool(magickey)
})


Game.on("initialSpawn", (p) => {
	//disabling other tools
	for (let t of p.inventory) {
		p.destroyTool(t)
	}

	//give magic key to users who earned it
	if (magickeyholders.includes(p.userId) ) {
		p.addTool(magickey)
		console.log("Player " + p.username + " has the magic key!")
	}

	p.setSpeed(6)
	p.setJumpPower(5)
	//set dash position
	p.setInterval(async function() {
		if (p.dashing==true) {
			if (p.jumpDashing==false) {
				let sped=2.5
				let rotx = p.position.x + sped * Math.sin(p.zrot / debug)
				let roty = p.position.y - sped * Math.cos(p.zrot / debug)
				p.setPosition(new Vector3(rotx, roty, p.zpos))
				let jumpbrick = new Brick(new Vector3(p.position.x-1, p.position.y-1, p.position.z-1), new Vector3(4, 4, 1))
				jumpbrick.visibility = 0
				Game.newBrick(jumpbrick)
				await sleep(250)
				jumpbrick.destroy()
			} else {
				let jumpbrick = new Brick(new Vector3(p.position.x-1, p.position.y-1, p.position.z+2.5), new Vector3(4, 4, 1))
				jumpbrick.visibility = 0
				Game.newBrick(jumpbrick)
				setZPos(p, p.position.z+3.5)
				await sleep(250)
				jumpbrick.destroy()
			}
		}
	}, 10)
})


//detects dash keys
Game.on("playerJoin", (p) => {
	p.keypress(async(key) => {
		if (key==="q") {
			dashplr(p)
		}
		if (key==="e") {
			dashplr(p,"jump")
		}
	})
})

async function dashplr(p,type) {
	//dash
	if (!p.cooldown && !p.dashing && p.toolEquipped==magickey) {
		p.zpos=p.position.z
		p.zrot=p.rotation.z
		p.cooldown=true
		p.dashing=true
		if (type=="jump") {
			p.jumpDashing=true
		}
		await sleep(250)
		p.dashing=false
		p.jumpDashing=false
		p.cooldown=false
	}
}

function setZPos(p,zpos) {
	let packet=new PacketBuilder("Figure")
		.write("uint32", p.netId)
		.write("string", "C")
		.write("float", zpos)
	packet.broadcast()
}

Game.command("givekey", (p,name) => {
	let v=getPlayer(name)
	if (p.userId==305122 || Game.local) {
		magickeyholders.push(v.userId)
		v.equipTool(magickey)
		fs.writeFileSync(keypath, JSON.stringify(magickeyholders))
		p.message("Successfully gave the magic key to " + v.username + "!")
	} else {
		p.message("Failed to execute command. Are you supposed to be using this?")
	}
})

Game.command("takekey", (p,name) => {
	let v=getPlayer(name)
	if ((p.userId==305122 || Game.local) && magickeyholders.includes(v.userId))  {
		magickeyholders.splice(magickeyholders.indexOf(v.userId),1)
		v.destroyTool(magickey)
		fs.writeFileSync(keypath, JSON.stringify(magickeyholders))
		p.message("Successfully took away the magic key from " + v.username + "!")
	} else {
		p.message("Failed to execute command. Are you supposed to be using this?")
	}
})

function getPlayer(name) {
    // copied from cheat's admin v2 because it just WORKS
    for (let player of Game.players) {
        if (player.username.toLowerCase().indexOf(String(name).toLowerCase()) == 0) {
            const victim = Array.from(Game.players).find(p => p.username === player.username)
            return victim
        }
    }
}