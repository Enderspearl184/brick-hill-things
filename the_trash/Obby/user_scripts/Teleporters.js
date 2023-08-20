const teleporters=[]

world.bricks.forEach((b) => {
	if (b.name.startsWith("tpfrom")) {
		b.tp = parseInt(b.name.replace("tpfrom",""))
		b.touching((p) => {
			teleporters.forEach((tp) => {
				if (tp.tp==b.tp) p.setPosition(new Vector3(tp.position.x+(tp.scale.x/2),tp.position.y+(tp.scale.y/2),tp.position.z+1))
			})
		})
	}
	if (b.name.startsWith("tpto")) {
		b.tp = parseInt(b.name.replace("tpto",""))
		teleporters.push(b)
	}
})