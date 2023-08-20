//this just makes it so that you can see the 

Game.on("playerJoin", (p) => {
	p.on("initialSpawn", () => {
		var position = new Vector3((p.position.x/6).toFixed(1), (p.position.y/6).toFixed(1), (p.position.z/6).toFixed(1))
		p.setInterval(function() {
			if (position.x!==(p.position.x/6).toFixed(1) || position.y!==(p.position.y/6).toFixed(1) || position.z!==(p.position.z/6).toFixed(1)) {
				let tempPosition = new Vector3(coordModifier((p.position.x/6).toFixed(1)), coordModifier((p.position.y/6).toFixed(1)), coordModifier((p.position.z/6).toFixed(1)))
				p.bottomPrint("Position: \\c6" + tempPosition.x + ", \\c5" + tempPosition.z + ", \\c4" + tempPosition.y, 100000)
				position.x=(p.position.x/6).toFixed(1)
				position.y=(p.position.y/6).toFixed(1)
				position.z=(p.position.z/6).toFixed(1)
			}
		}, 250)
	})
})

function coordModifier (pos) {
	if (pos=="-0.0") pos=0
	if (pos.toString().split(".")[1]==0) pos=parseInt(pos.toString().split(".")[0])
	return pos
}