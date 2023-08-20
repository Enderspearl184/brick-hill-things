const soundbrick = require("./sound-brick/index.js")
const physics = require("./physicsModule.js")
var currentType;

let basicOutfit = new Outfit()
 	.body("#0d9436")
  	.torso("#694813")
  	.rightLeg("#694813")
	.leftLeg("#694813")

let fireOutfit= new Outfit()
	.head("#FF0C00")
	.leftArm("#FF0C00")
	.leftLeg("#FFB224")
	.torso("#FF6506")
	.rightArm("#FF0C00")
	.rightLeg("#FFB224")

let flyingOutfit = new Outfit()
	.head("#FEFEFE")
	.torso("#E6E6E6")
	.leftArm("#FEFEFE")
	.leftLeg("#C0C0C0")
	.rightArm("FEFEFE")
	.rightLeg("#C0C0C0")
	.hat1(349365)

const zombieTypes=[
	{
		name: "Zombies",
		zombieSpeed: 32*0.65,
		outfit: basicOutfit,
		id: "basic"
	},
	{
		name: "Fast Zombies",
		zombieSpeed: 64*0.65,
		outfit: fireOutfit,
		id: "speed"
	},
	{
		name: "Big Zombies",
		zombieSpeed: 48*0.65,
		outfit: basicOutfit,
		id: "big",
		scale: new Vector3(5,5,5)
	},
	{
		name: "Flying Zombies",
		zombieSpeed: 26*0.65,
		outfit: flyingOutfit,
		id: "big",
		scale: new Vector3(0.75,0.75,0.75),
		flying:true
	}
]

for (let i in Game.Plates) {
	Game.Plates[i].botcorner1 = {x:Game.Plates[1].plate.position.x-25, y: Game.Plates[1].plate.position.y-25}
	Game.Plates[i].botcorner2 = {x:Game.Plates[1].plate.position.x+125, y: Game.Plates[1].plate.position.y+125}
}

function isCollide(brick, bot) {
	let d1x = brick.position.x - (bot.position.x + bot.scale.x)
	let d1y = brick.position.y - (bot.position.y + bot.scale.y)
	//let d1z = brick.position.z - (bot.position.z + (bot.scale.z*5))
	let d2x = (bot.position.x - (bot.scale.x)) - (brick.position.x  + brick.scale.x)
	let d2y = (bot.position.y - (bot.scale.y)) - (brick.position.y  + brick.scale.y)
	//let d2z = (bot.position.z) - (brick.position.z  + brick.scale.z)
	if (d1x > 0 || d1y > 0 || d2x > 0 || d2y > 0) {
		return false
	}
	return true
}
const safebricks = world.bricks.filter(b=>(b.name && (b.name.startsWith("Baseplate") || b.name.startsWith("Plate") || b.name=="_bot")))
async function newZombie(pos) {
	let zombie = new Bot("Zombie")
	zombie.position=pos
	zombie.colors=currentType.outfit.colors //this is probably *the* worst way of doing this but it works so idc
	zombie.assets=currentType.outfit.assets
	if (currentType.scale) {
		zombie.scale=currentType.scale
	}
	await Game.newBot(zombie)
	if (!Game.settings.zombieUseOutfit) {
		zombie.setAvatar(Game.settings.zombieId)
	}

	let brick = new Brick()
	brick.name="_bot"
	brick.scale = new Vector3(2*zombie.scale.z,2*zombie.scale.y,5*zombie.scale.z)
	brick.collision = false
	brick.visibility = 0
	zombie.brick = brick
	Game.newBrick(brick)
	safebricks.push(brick)
	zombie.setInterval(async() => {
 		let target = zombie.findClosestPlayer(500)
		let bricks = [].concat(safebricks)
		//only care about bricks on plots we are close to, or stuff like zombie bricks or whatever
		for (let i in Game.Plates) {
			let plate = Game.Plates[i]
			if (isCollide(plate.plate, zombie)) {
				bricks = bricks.concat(plate.bricks)
			}
		}

		if (target && (currentType.flying || Game.settings.allZombiesFly)) {
			if (!isFinite(zombie._zVelc)) {zombie._zVelc=0}
			if (target.position.z>zombie.position.z) {
				zombie._zVelc+=0.125
				if (zombie._zVelc>0.75) {
					zombie._zVelc=0.75
				}
			} else {
				zombie._zVelc-=0.1
			}
		}
		//console.log(zombie._zVelc)
 		//physics move :)
		await physics(zombie,target,currentType.zombieSpeed * Game.settings.zombieSpeedMult, bricks)
		brick.position=new Vector3(zombie.position.x - zombie.scale.x,zombie.position.y - zombie.scale.y,zombie.position.z - zombie.scale.z)
		if (Game.settings.dayTime) {
			zombie.destroy()
			brick.destroy()
			safebricks.splice(safebricks.indexOf(brick), 1)
		}
	}, 20)
	brick.touching((p) => {
		if (!p.invincible) {
			p.kill()
		}
  	})
}

let spawnBricks=world.bricks.filter(brick => brick.name=="ZombieSpawner")

setInterval(async function() { //spawn zombie loop!
	await sleep(Math.random() * (25 - 1) + 1) //wait random between 1 and 50 ms so theres different delays between each movement
	if (Game.settings.dayTime==false && (Math.floor(Math.random() * 3) + 1)==3) {
		if (world.bots.length<Game.settings.maxZombies) {	
			let spawnerChosen=spawnBricks[Math.floor(Math.random() * spawnBricks.length)];
			newZombie(new Vector3(spawnerChosen.position.x, spawnerChosen.position.y,1))
		}
	}
},250)


setInterval(async function(){ //resend sound brick loop!
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
	const type = zombieTypes[Math.floor(Math.random() * zombieTypes.length)];
	currentType=type;
	Game.centerPrintAll("Here come the " + type.name, 2)
	Game.setEnvironment({ skyColor: Game.settings.nightSky })
	Game.settings.dayTime=false
	Game.players.forEach((p) => {p.survived=true})

	soundbrick({
		url: "/sounds/winds_of_fjord.mp3", // [Required]
		isGlobal: true, // [Required] If enabled then position, minDistance and maxDistance will be ignored
		isloop: true // [Optional] [NOTE: If enabled then isGlobal will be set to true] If enabled then current playing loop will start over if url isnt the same
	})

	let nightTime=Game.settings.maxNight
	while (nightTime) {
		await sleep(1000)
		if (Game.players.length) {
			nightTime--
			Game.topPrintAll("The zombies will stop in " + nightTime, 1000)
		} else {
			return false
		}
	}
	return true
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
	
	let dayTime=Game.settings.maxDay
	while (dayTime) {
		await sleep(1000)
		if (Game.players.length) {
			dayTime--
			Game.topPrintAll("The zombies will be coming in " + dayTime, 1000)
		} else {
			dayTime=Game.settings.maxDay
		}
	}
	return nightCycle()
}

async function cycle() {
	while (true) {
		await dayCycle()
	}
}

cycle()