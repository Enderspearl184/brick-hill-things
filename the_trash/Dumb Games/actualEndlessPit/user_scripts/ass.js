Game.sendBricks=false

Game.on("playerJoin", async(p)=>{
	for (let brick of world.bricks) {
		await p.newBrick(brick)
	}
	p.kill=function(){}
	let pitBricks=p.localBricks.filter((b)=>b.name=="PIT")
	p.on("moved", (pos) => {
		pitBricks.forEach((b)=>{
			let zPos=p.position.z-(b.scale.z/2)
			b.setPosition(new Vector3(b.position.x,b.position.y,zPos))
			let fallDistance=0-Math.floor(p.position.z)
			if (fallDistance<0) fallDistance=0
			if (fallDistance>2147483647) fallDistance=2147483647
			p.setScore(fallDistance)
		})
	})
})

world.bricks.find((b)=>b.name=="TELE").touching((p)=>{
	p.setPosition(new Vector3(0,550,0))
})