//this script checks if a user is the owner of the set when they join.
//if the user is the set owner then player.owner=true
//this WILL cause loading in to take longer.

const phin = require('phin')

var UseTeams=true //change to false to prevent setting teams automatically

//actually checking for if the player is the owner
Game.on("playerJoin", async(p) => {

	//gets the set info
	p.SetInfo = await phin("https://www.brick-hill.com/api/profile/sets/" + p.userId)

	//turns the response in to text and parses the string as json
	p.JSONSetInfo = JSON.parse(p.SetInfo.body.toString())

	//checks if any of the set ids listed are this set id, if any are, changes the player's team to the owner team,
	if (p.JSONSetInfo.data.some(set => set.id == Game.gameId)) {
		p.owner=true
	}
})

//setting teams automatically (if UseTeams is set to true)
if (UseTeams) {
	var ownerteam=false
	var playerteam=false
	//checking if owner team exists and/or player team exists
	for (let t of world.teams) {
		if (t.name=="Owner") {
			ownerteam=t
		}
		if (t.name=="Player") {
			playerteam=t
		}
	}

	//if owner team doesn't exist it creates one
	if (!ownerteam) {
		ownerteam = new Team("Owner", "#00a3db")
		Game.newTeam(ownerteam)
	}

	//if player team doesn't exist it creates one
	if (!playerteam) {
		playerteam = new Team("Player", "#25db25")
		Game.newTeam(playerteam)
	}

	Game.on("initialSpawn", (p) => {
		if (p.owner) {
			p.setTeam(ownerteam)
		} else p.setTeam(playerteam)
	})
}