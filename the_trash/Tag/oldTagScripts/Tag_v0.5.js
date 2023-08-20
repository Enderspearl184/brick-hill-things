var It=null
var Runners=null
var freezeMode=false
Game.assignRandomTeam=false

for (let t of world.teams) {
	if (t.name=="Taggers") It = t
	if (t.name=="Runners") Runners = t
}

Game.command("freezemode", (p) => {
	if (Game.local==false && p.userId!==305122) return
	if (freezeMode==false) {
		Game.messageAll("[#ff0000][SERVER]: [#ffffff]Freeze Mode has been turned on!")
		freezeMode=true
	} else {
		Game.messageAll("[#ff0000][SERVER]: [#ffffff]Freeze Mode has been turned off!")
		freezeMode=false
	}
})

Game.on("playerJoin", (p) => {
	p.on("initialSpawn", async() => {
		
		let RunnerPlayers = 0
		let ItPlayers=0
		//setting team so there are usually about double the runners to taggers
		for (let players of Game.players) {
			if (p.team && p.team==It) ItPlayers+=1
			if (p.team && p.team==Runners) RunnerPlayers+=1
		}
		if (RunnerPlayers/2>=ItPlayers) {
			p.setTeam(It)
		} else {
		}

		await sleep(100)
		p.brick.touching((player) => {
			if (player==p) return
			if (freezeMode==false) {
				swapTeam(p, player)
			} else freezePlr(p, player)
		})
	})
})

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

function freezePlr(freeze, p) {
	if (p.team==It && freeze.team==Runners) {
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

setInterval(function() {
	var allFrozen=true
	if (Game.playerCount<2) Game.topPrintAll("At least 2 players are needed for this game to function")
	for (let p of Game.players) 
		if (freezeMode==false) {
			allFrozen=false
			if (p.frozen==true) {
				p.setAvatar(p.userId)
				p.frozen=false
			}
		} else {
			if (p.frozen==false && p.team==Runners) allFrozen=false
		}
	}
	
	if (allFrozen==true && freezeMode==true) {
		freezeMode=false
		Game.messageAll("[#ff0000][SERVER]: [#ffffff]The Taggers have won! Returning to normal mode.")
	}

}, 100)