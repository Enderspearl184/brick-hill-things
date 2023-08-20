Game.on("playerJoin", (player) => {
    player.on("initialSpawn", () => {
	if (HammerBanned.includes(player.username)) return p.kick("You have been banned from this set")
	player.banHammer = false
        createBrick(player)
	for (let players of Game.players) {
		sendClickable(false, players.brick, player)
		sendCollision(true, players.brick, player)
	}
    })
})

const AllowedPlayers = [305122, 1] //put userid here
const HammerBanned = []

let banHammer = new Tool("BanHammer")
banHammer.model = 20681

banHammer.equipped((p) => {
	for (let player of Game.players) {
		sendClickable(true, player.brick, p)
		if (player!==p) sendCollision(true, player.brick, p)
	}
})

banHammer.unequipped((p) => {
	for (let player of Game.players) {
		sendClickable(false, player.brick, p)
		if (player!==p) sendCollision(true, player.brick, p)
	}
})

Game.command("banhammer", (p, v) => {
	if (!AllowedPlayers.includes(p.userId)) return p.message("You can't do that")
	let victim = getPlayer(v)
	if (!victim) return p.message("Player doesn't exist")
	if (victim.BanHammer) return removeBanHammer(victim)
	giveBanHammer(victim)
})

Game.command("banlist", (p, unused) => {
	console.log(HammerBanned)
})

Game.command("unban", (p, name) => {
	if (!AllowedPlayers.includes(p.userId)) return p.message("You can't do that")
	if (!HammerBanned.includes(name)) return p.message("User is not banned")
	HammerBanned.splice(HammerBanned.indexOf(name), 1)
	return p.message("User has been unbanned!")
})

function giveBanHammer(p) {
	p.BanHammer=true
	p.equipTool(banHammer)
}

function removeBanHammer(p) {
	p.banHammer=false
	p.destroyTool(banHammer)
}

function getPlayer(name) {
	//again copied from cheats admin v2
	for (let player of Game.players) {
		if (player.username.toLowerCase().indexOf(String(name).toLowerCase()) == 0) {
			const victim = Array.from(Game.players).find(p => p.username === player.username)
			return victim
		}
	}
}

async function createBrick(p) {
    let brick = new Brick(new Vector3(1, 1, 1), new Vector3(4, 4, 5), "#f54242")
    brick.visibility = 0
    brick.clickable=true
    brick.p = p
    p.brick = brick
    Game.newBrick(brick)

    for (let player of Game.players) {
	if (!player.toolEquipped==banHammer) sendClickable(false, brick, player)
	if (player.toolEquipped==banHammer) sendClickable(true, brick, player)
    }

    await sleep(5000) // packet loss still a thing?
    var lastposition = new Vector3(0,0,0)
    sendCollision(false, brick, p)

    brick.clicked((p) => {
	if (p.toolEquipped==banHammer) {
		HammerBanned.push(brick.p.username)
		brick.p.kick("The Ban Hammer has spoken!")
	}
    })

    brick.setInterval(() => {
        if (p.destroyed) brick.destroy()
        if (p.position.x !== lastposition.x || p.position.y !== lastposition.y || p.position.z !== lastposition.z) {
            lastposition.x = p.position.x
            lastposition.y = p.position.y
            lastposition.z = p.position.z
            brick.setPosition(new Vector3(p.position.x-2,p.position.y-2,p.position.z))
        }
        if (p.alive == false) {
            brick.setPosition(new Vector3(-999,-999,-999))
        }
    }, 100);

    brick.setInterval(() => {
        sendCollision(false, brick, p)
    }, 1000); // de-wackyifyer
}


async function sendClickable(canClick, brick, p) {
	await sleep(100)
	
	let clickpacket = new PacketBuilder("Brick")
	.write("uint32", brick.netId)
	.write("string", "clickable")
	.write("bool", canClick)
	.write("uint32", 1000000)
	clickpacket.send(p.socket)
}

async function sendCollision(canCollide, brick, p) {
	await sleep(100)
	
	let collidepacket = new PacketBuilder("Brick")
	.write("uint32", brick.netId)
	.write("string", "collide")
	.write("bool", canCollide)
	collidepacket.send(p.socket)
}