// Sword Script by SmartLion
// Credit not required
// SemVer 1.0.1

const buildZoneXY = -116
const buildZoneZ = -100000
const buildZoneXY2 = -45
const buildZoneZ2 = 100000

// Settings \\
swordDamage = 10 // How much damage does the sword deal when clicked?
swordRange = 8 // How far can the sword hit players?
swordModelID = 2930 // The mesh of the sword from the store ID

effectsEnabled = false // Enable or disable particles effects? Note: This will disable all related settings (Disable if your server crashes or lags when this is enabled)
	particleSize = new Vector3(0.5,0.5,0.5) // The size of the particles
	hitParticles = false // If true then particles will emit from damaged players
	redBlood = false // If false then particles will be a random color
	deathExplosion = true // When the player dies they make a big brick explosion

legacyBug = false // Enable the "player can still kill players if dead" bug

// Settings \\





let tool = new Tool("Sword")
tool.model = swordModelID
Game.on("playerJoin", (player) => {
	player.on("initialSpawn", () => {
		player.setInterval(function() {
			if (player.position.x < buildZoneXY || player.position.x > buildZoneXY2 || player.position.y < buildZoneXY || player.position.y > buildZoneXY2 || player.position.z < buildZoneZ || player.position.z > buildZoneZ2) {
				if (player.sword) {
					player.sword=false
					player.destroyTool(tool)
				}
			} else if (!player.sword) {
				player.sword=true
				player.equipTool(tool)
			}
		}, 100)
	})
})

tool.on("activated", (attacker) => {
    if (attacker.alive == false && legacyBug == false) return
    for (let player of Game.players) {
        if (Game.pointDistance3D(attacker.position, player.position) <= swordRange) {
            if (player.username !== attacker.username) {
            if (player.alive == true) { // A check to see if the player is attacking themselfs or their target is already dead
		if (attacker.position.x < buildZoneXY || attacker.position.x > buildZoneXY2 || attacker.position.y < buildZoneXY || attacker.position.y > buildZoneXY2 || attacker.position.z < buildZoneZ || attacker.position.z > buildZoneZ2) return
		if (player.position.x < buildZoneXY || player.position.x > buildZoneXY2 || player.position.y < buildZoneXY || player.position.y > buildZoneXY2 || player.position.z < buildZoneZ || player.position.z > buildZoneZ2) return
                    player.setHealth(player.health - swordDamage) // Damage the player
                    if (effectsEnabled == true && hitParticles == true) {
                        damagecolor = 0
                        if (redBlood == false) {
                            damagecolor = randomColor()
                        } else {
                            damagecolor = "ff0000"
                        }
                        playerexplode(player,damagecolor) 
                    }
                    if (player.alive == false) { // Was the player killed? Award the killer with a point
                    Game.messageAll(`\\c6${attacker.username} killed ${player.username}`)
                    }
                }
            }
        }
    }
})

function playerexplode(player,color) {
    let brick = new Brick(player.position,particleSize,color)
    Game.newBrick(brick)
    var grav = 0.8
    var time = 0
    var prot = randomIntFromInterval(0,9999)
    brick.setInterval(() => {
        var rotx = brick.position.x += 1 * Math.sin(prot)
        var roty = brick.position.y - 1 * Math.cos(prot)
        var rotz = brick.position.z += grav
        grav -= 0.1
        brick.setPosition(new Vector3(rotx,roty,rotz))
        time++
        if (time > 80 && !brick.destroyed) {
            brick.destroy()
        }
    }, 35)
}

Game.on('playerJoin', (p) => {
    p.on("died", () => {
        if (effectsEnabled == false || deathExplosion == false) return // If effects or explosions are disabled then dont run anything
        deathcolor = 0
        if (redBlood == false) {
            deathcolor = randomColor()
        } else {
            deathcolor = "#ff0000"
        }
        for (i = 0; i < 5; i++) { //repeat 5 times for 5 blocks
            playerexplode(p,deathcolor)
        }
    })
})

function randomColor() {
    return '#' + ('00000'+(Math.random()*(1<<24)|0).toString(16)).slice(-6)
}

function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}