Game.settings={
	zombieUseOutfit:true,
	zombieId:8389,
	maxZombies:25,
	dayTime:true,
	nightSky:"#000000",
	daySky:"#7DB2E6",
	zombieSpeed:20
}

const soundbrick = require("./sound-brick/index.js")

const outfit = new Outfit()
 	.body("#0d9436")
  	.torso("#694813")
  	.rightLeg("#694813")
	.leftLeg("#694813")

async function newZombie(pos) {
	let zombie = new Bot("Zombie")

	if (Game.settings.zombieUseOutfit) {
		zombie.setOutfit(outfit)
	} else {
		await zombie.setAvatar(Game.settings.zombieId)
	}
	zombie.position=pos
	Game.newBot(zombie)

	let brick = new Brick(new Vector3(1, 1, 1), new Vector3(2, 2, 5), "#f54242")
	brick.visibility = 0
	brick.collision = false
	brick.name="zombie"

	Game.newBrick(brick)

	zombie.zombieBrk=brick
	let zVelcUp = 0
	let zVelc=0
	brick.zombie=zombie
	let zombieZ
	zombie.setInterval(() => {
 		let target = zombie.findClosestPlayer(500)
		zombie.zombiePos=new Vector3(zombie.zombieBrk.position.x,zombie.zombieBrk.position.y,zombie.zombieBrk.position.z)
  		if (!target) return zombie.setSpeech("")

  		//zombie.setSpeech("BRAAINNNSSS!")
		
 		zombie.moveTowardsPlayer(target, Game.settings.zombieSpeed)
		zombie.zombieBrk.setPosition(new Vector3(zombie.position.x - (zombie.zombieBrk.scale.x / 2),zombie.position.y - (zombie.zombieBrk.scale.y / 2),zombie.position.z))
		let partCol = world.bricks.filter(other=>other!=zombie.zombieBrk && zombie.zombieBrk.intersects(other) && (other.collision || other.name=="zombie")) 
		if (partCol.length) {
			let mostHeight = partCol[0].position.z + partCol[0].scale.z
			partCol.forEach(brick => {
				if (brick.position.z + brick.scale.z > mostHeight) mostHeight = brick.position.z + brick.scale.z
			})
			if(zombie.zombieBrk.position.z+2 >= mostHeight && zVelcUp> -0.5){
				zombie.zombieBrk.position.z = mostHeight
				zVelcUp = 1
			}else{
				zombie.zombieBrk.setPosition(zombie.zombiePos)
				if (zVelcUp === 1){ zombieZ = zombie.zombieBrk.position.z }
				zombie.zombieBrk.position.z += zVelcUp
				if(zombie.zombieBrk.position.z >= zombieZ ){
					zVelcUp -= .05
				}else{
					zombie.zombieBrk.position.z = zombieZ
					zVelcUp = 1
				}
			}
		} else {
			zombie.position.z -= zVelc
			zombie.zombieBrk.position.z -= zVelc
			zVelc += .05
		}
		
		zombie.setPosition(new Vector3(zombie.zombieBrk.position.x + (zombie.zombieBrk.scale.x/2),zombie.zombieBrk.position.y + (zombie.zombieBrk.scale.y/2),zombie.zombieBrk.position.z))
		if (Game.settings.dayTime) {zombie.zombieBrk.destroy();zombie.destroy()}

	}, 25)

	let touchEvent = zombie.touching((p) => {
  		p.kill()
	})
}
//newZombie(new Vector3(0,0,10))

let spawnBricks=world.bricks.filter(brick => brick.name=="ZombieSpawner")

setInterval(function() { //spawn zombie loop!
	if (Game.settings.dayTime==false && (Math.floor(Math.random() * 3) + 1)==3) {
		if (world.bots.length<Game.settings.maxZombies) {	
			let spawnerChosen=spawnBricks[Math.floor(Math.random() * spawnBricks.length)];
			newZombie(new Vector3(spawnerChosen.position.x, spawnerChosen.position.y,1))
		}
	}
},500)

setInterval(function(){ //resend sound brick loop!
		if (!Game.settings.dayTime) {
			soundbrick({
				url: "/sounds/winds_of_fjord.mp3", // [Required]
				isGlobal: true, // [Required] If enabled then position, minDistance and maxDistance will be ignored
				isloop: true // [Optional] [NOTE: If enabled then isGlobal will be set to true] If enabled then current playing loop will start over if url isnt the same
			})
		} else {
			soundbrick({
				url: "/sounds/silence.mp3", // [Required]
				isGlobal: true, // [Required] If enabled then position, minDistance and maxDistance will be ignored
				isloop: true // [Optional] [NOTE: If enabled then isGlobal will be set to true] If enabled then current playing loop will start over if url isnt the same
			})
		}
},1000)


async function nightCycle() {
	Game.setEnvironment({ skyColor: Game.settings.nightSky })
	Game.settings.dayTime=false
	Game.players.forEach((p) => {p.survived=true})
	soundbrick({
		url: "/sounds/winds_of_fjord.mp3", // [Required]
		isGlobal: true, // [Required] If enabled then position, minDistance and maxDistance will be ignored
		isloop: true // [Optional] [NOTE: If enabled then isGlobal will be set to true] If enabled then current playing loop will start over if url isnt the same
	})
	let nightTime=120
	while (nightTime) {
		await sleep(1000)
		if (Game.players.length) {
			nightTime--
			Game.topPrintAll("The zombies will stop in " + nightTime, 1000)
		} else {
			return dayCycle()
		}
	}
	return dayCycle()
}

async function dayCycle() {
	Game.settings.dayTime=true
	Game.players.forEach((p) => {if (p.survived) p.setScore(p.score+1)})
	Game.setEnvironment({ skyColor: Game.settings.daySky })
	soundbrick({
		url: "/sounds/silence.mp3", // [Required]
		isGlobal: true, // [Required] If enabled then position, minDistance and maxDistance will be ignored
		isloop: true // [Optional] [NOTE: If enabled then isGlobal will be set to true] If enabled then current playing loop will start over if url isnt the same
	})
	let dayTime=95
	while (dayTime) {
		await sleep(1000)
		if (Game.players.length) {
			dayTime--
			Game.topPrintAll("The zombies will be coming in " + dayTime, 1000)
		} else {
			dayTime=90
		}
	}
	nightCycle()
}

dayCycle() //start the time cycles!