Game.on("initialSpawn", async(p) => {
	let ownsShirt=await p.ownsAsset(268514)
        if (ownsShirt) {
        world.bricks.forEach((brick)=>{
		if (brick.name=="door") {
		    brickPacket = new PacketBuilder("Brick")
      			.write("uint32", brick.netId)
			.write("string", "collide")
			.write("bool", false)
		    brickPacket.send(p.socket)
		}
	})
	}
})