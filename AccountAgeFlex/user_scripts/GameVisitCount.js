var phinmodule = getModule('phin')

async function getGameVisits(plr) {
	var playerexists=false
	for (let players of Game.players) {
		if (plr==players) playerexists=true
	}

	if (playerexists==false) return console.log("player doesn't exist")

	let userProfile = await phinmodule("https://www.brick-hill.com/user/" + plr.userId)
	//removes whitespace so it can remove everything else
	let string1 = userProfile.body.toString().replace(/\s/g, '')

	//removes most characters before forum post integer
	let string2 = string1.replace(/(.)*id="game-/m, '')

	//removes "," because it messes the result up if user has more than 999 posts
	let string3 = string2.replace(/,/g, '')
	
	//gets the forum post number
	let gameVisits = string3.match(/\d+/).shift();

	plr.gameVisits = parseInt(gameVisits)
	console.log("Visits: " + plr.gameVisits)
	return plr.gameVisits
}

module.exports=getGameVisits