const colours=["FFFF00", "FF0000", "FF00FF", "0000FF", "00FFFF", "00FF00"]

let winbrick = world.bricks.find((b) => b.name=="Win")

winbrick.setInterval(function() {
	winbrick.setColor(colours[Math.floor(Math.random() * colours.length)])
},250)