var phin = require('phin')

Game.on("initialSpawn", (p) => {
	p.setInterval(async function() {
		await getGameVisits(p)
		p.topPrint("Game Visits: " + p.forumPosts + " \(may or may not be a hint for something new\)", 1000)
	}, 10000)
})

async function getGameVisits(p) {
	var playerexists=false
	for (let players of Game.players) {
		if (p==players) playerexists=true
	}

	if (playerexists==false) return console.log("player doesn't exist")

	let userProfile = await phin("https://www.brick-hill.com/user/" + p.userId)
	//removes whitespace so it can remove everything else
	let string1 = userProfile.body.toString().replace(/\s/g, '')

	//removes most characters before forum post integer
	let string2 = string1.replace(/(.)*id="game-/m, '')

	//removes "," because it messes the result up if user has more than 999 posts
	let string3 = string2.replace(/,/g, '')
	
	//gets the forum post number
	let forumPosts = string3.match(/\d+/).shift();

	p.forumPosts = parseInt(forumPosts)
	return p.forumPosts
}