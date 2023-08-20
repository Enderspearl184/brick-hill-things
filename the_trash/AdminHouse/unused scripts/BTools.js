//Enderspearl184's Btools script without custom brick sizes. This version is less laggy.
// /paint lets players change the colour of bricks they place using hexadecimal codes.

let tool = new Tool("2x2x2")
let tool2 = new Tool("Remove")
let tool3 = new Tool("Colour")
Game.on("playerJoin", (player) => {
   player.HexColor="#f54242"	
   
   player.on("initialSpawn", () => {
       player.equipTool(tool)
       player.equipTool(tool2)
       player.equipTool(tool3)
   })
})

Game.command("paint", (p, hex) => {
	p.message("Colour has been changed")
	p.HexColor = hex
})

tool.on("activated", (p) => {
	let brick = new Brick(new Vector3(Math.round(p.position.x)-1, Math.round(p.position.y)-1, Math.round(p.position.z)-1), new Vector3(2, 2, 2), p.HexColor)
	brick.visibility = 1
	brick.Placed = true
	brick.setClickable(true, 100000)
	Game.newBrick(brick)
	brick.clicked(debounce((p) => {
    		 if (p.EquippedTool==true) {
			console.log(p.username, "destroyed a brick")
		 	brick.destroy()
		 }
		 if (p.EquippedPaint==true) {
		 	console.log(p.username, "painted a brick", p.HexColor)
			    try {
       				 return brick.setColor(p.HexColor)
    			    } catch {p.message("Failed to change color")}
		 }
	}), 500)
})

tool2.on("equipped", (p) => {
	p.EquippedTool = true
})
tool2.on("unequipped", (p) => {
	p.EquippedTool = false
})
tool3.on("equipped", (p) => {
	p.EquippedPaint = true
})
tool3.on("unequipped", (p) => {
	p.EquippedPaint = false
})