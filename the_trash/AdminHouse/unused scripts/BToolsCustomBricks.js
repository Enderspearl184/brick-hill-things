//Enderspearl184's Btools script with custom brick sizes. Just note that custom bricks are slower.
// /paint lets players change the colour of bricks they place using hexadecimal codes.
// /brickx /bricky /brickz all change the size of custom bricks on their respective axis. I couldn't get it to work with just one command ok?

let tool4= new Tool("Custom")
let tool = new Tool("2x2x2")
let tool2 = new Tool("Remove")
let tool3 = new Tool("Colour")
Game.on("playerJoin", (player) => {
   player.HexColor="#f54242"
   player.SizeX=2
   player.SizeY=2
   player.SizeZ=2
   player.SizeX2=1
   player.SizeY2=1
   player.SizeZ2=1	
   
   player.on("initialSpawn", () => {
       player.equipTool(tool)
       player.equipTool(tool4)
       player.equipTool(tool2)
       player.equipTool(tool3)
   })
})

Game.command("paint", (p, hex) => {
	p.message("Colour has been changed")
	p.HexColor = hex
})

Game.command("brickx", (player, x) => {
	player.message("Custom X value has been changed")
	player.SizeX = x
	if (player.SizeX > 10) player.SizeX=10
	if (player.SizeX < 1) player.SizeX=1
	player.SizeX2=Math.round(player.SizeX/2)
})
Game.command("bricky", (player, y) => {
	player.message("Custom Y value has been changed")
	player.SizeY = y
	if (player.SizeY > 10) player.SizeY=10
	if (player.SizeY < 1) player.SizeY=1
	player.SizeY2=Math.round(player.SizeY/2)
})
Game.command("brickz", (player, z) => {
	player.message("Custom Y value has been changed")
	player.SizeZ = z
	if (player.SizeZ > 10) player.SizeZ=10
	if (player.SizeZ < 1) player.SizeZ=1
	player.SizeZ2=Math.round(player.SizeZ/2)
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

tool4.on("activated", (p) => {
	let brick = new Brick(new Vector3(Math.round(p.position.x)-p.SizeX2, Math.round(p.position.y)-p.SizeZ2, Math.round(p.position.z+1)-p.SizeY), new Vector3(p.SizeX, p.SizeZ, p.SizeY), p.HexColor)
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