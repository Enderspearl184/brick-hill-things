var It=null
var Runners=null
const maxTime=100
var time=maxTime
//var freezeMode=true
var ItPlayers=0
var RunnerPlayers=0
Game.assignRandomTeam=false

for (let t of world.teams) {
	if (t.name=="Taggers") It = t
	if (t.name=="Runners") Runners = t
}


//unused
//Game.command("f", (p) => {
//	if (Game.local==false && p.userId!==305122) return
//	if (freezeMode==false) {
//		Game.messageAll("[#ff0000][SERVER]: [#ffffff]Freeze Mode has been turned on!")
//		freezeMode=true
//	} else {
//		Game.messageAll("[#ff0000][SERVER]: [#ffffff]Freeze Mode has been turned off!")
//		freezeMode=false
//	}
//})

Game.on("playerJoin", (p) => {
	p.on("initialSpawn", async() => {

		//getting the number of players on each team

		//using logic to set what team they join on
		if (RunnerPlayers/2>=ItPlayers) {
			p.setTeam(It)
		} else {
			p.setTeam(Runners)
		}

		p.setInterval(function() {
			if (p.waitTime==true) {
				p.waitTime=false
			}
		}, 2000)

		await sleep(100)
		p.brick.touching((player) => {
			if (player==p) return
			freezePlr(p, player)
		})
	})
})

//unused rn
async function swapTeam(v, p) {
	if (p.waitTime==true || v.waitTime==true || v.team==It || p.team==Runners) return
	p.waitTime=true
	v.waitTime=true
	p.setTeam(Runners)
	v.setTeam(It)
	v.centerPrint("Oh no, you got tagged!")
	await sleep(1000)
	v.waitTime=false
	p.waitTime=false

}

async function freezePlr(freeze, p) {
	if (p.team==It && freeze.team==Runners && freeze.frozen==false) {
		if (p.waitTime==true) return
		p.waitTime=true
		freeze.frozen=true
		let freezeOutFit = new Outfit(freeze)
			.body("#0091ff")
			.set()
		freeze.setSpeed(0)
		freeze.setJumpPower(0)
		freeze.centerPrint("Oh no, you have been frozen!")
	} else if (p.team==Runners && freeze.team==Runners && freeze.frozen==true) {
		freeze.frozen=false
		freeze.setAvatar(freeze.userId)
		freeze.setSpeed(4)
		freeze.setJumpPower(5)
		freeze.centerPrint("You have been thawed!")
	}
}

async function randomizeTaggers() {
	let allPlayers = []
	for (let p of Game.players) {
		allPlayers.push(p)
	}
	for (i=0; i<=Game.playerCount/2; i++) {
		let player = await allPlayers[random(1, Game.playerCount)]
		if (player) {
			player.setTeam(It)
			allPlayers.splice(allPlayers.indexOf(player), 1)
		}
	}
}

//rng
function random(min, max) {  
	return Math.floor(Math.random() * (max - min) + min)-1
} 

//loop
setInterval(function() {
	var noTaggers=true
	var allFrozen=true
	let RunnerPlrs=0
	let ItPlrs=0


	if (Game.playerCount<2) Game.topPrintAll("At least 2 players are needed for this game to function")
	for (let p of Game.players) {

		//gets count of taggers and runners
		if (p.team==It) {
			noTaggers=false
			ItPlrs+=1
		} 
		if (p.team==Runners) {
			RunnerPlrs+=1
		}

		//if someone ISN'T frozen, then not EVERYONE is frozen
		if (p.frozen==false && p.team==Runners) {
			allFrozen=false
		}
		if (!p.team) {
			allFrozen=false
		}
	}
	
	//randomize taggers if none exist
	if (noTaggers==true && Game.playerCount>=2) {
		Game.messageAll("[#ff0000][SERVER]: [#ffffff]All Taggers have left, meaning that the Runners have won! Restarting...")
		for (let p of Game.players) {
			p.frozen=false
			p.setAvatar(p.userId)
			p.setSpeed(4)
			p.setJumpPower(5)
		}
		randomizeTaggers()
	}

	//message all if the 
	if (allFrozen==true && Game.playerCount>=2) {
		Game.messageAll("[#ff0000][SERVER]: [#ffffff]The Taggers have won! Restarting...")
		for (let p of Game.players) {
			p.frozen=false
			p.setAvatar(p.userId)
			p.setSpeed(4)
			p.setJumpPower(5)
		}
		time=maxTime
	}

	//sets tagger and runner count accordingly
	RunnerPlayers=RunnerPlrs
	ItPlayers=ItPlrs
}, 100)

setInterval(function() {
	time--
	
	//prevent time from decreasing if less than 2 players
	if (Game.playerCount<2) {
		time=maxTime
	} else {
		Game.topPrintAll("Time Left: " + time, 2)
	}
	
	if (time<=0) {
		Game.messageAll("[#ff0000][SERVER]: [#ffffff]The Runners have won! Restarting...")
		for (let p of Game.players) {
			p.frozen=false
			p.setAvatar(p.userId)
			p.setSpeed(4)
			p.setJumpPower(5)
		}
		time=maxTime
	}
}, 1000)