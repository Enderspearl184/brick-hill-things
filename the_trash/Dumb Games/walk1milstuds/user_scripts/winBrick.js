const colours=["FFFF00", "FF0000", "FF00FF", "0000FF", "00FFFF", "00FF00"]

let winbrick = world.bricks.find((b) => b.name=="winbrick")
let winteam = world.teams.find((t) => t.name=="WINNERS!")

winbrick.setInterval(function() {
	winbrick.setColor(colours[Math.floor(Math.random() * colours.length)])
},250)

winbrick.touching((p) => {
	if (!p.won) {
		Game.messageAll("[#FF0000][SERVER]:[#ffffff] " + p.username + " has reached the end of the path!")
	}
	p.won=true
	p.setTeam(winteam)
	p.setScore(1000000)
	p.setPosition(new Vector3(125.5,30.5,5))
})