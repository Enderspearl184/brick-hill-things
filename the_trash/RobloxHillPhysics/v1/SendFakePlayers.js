Game.on("playerJoin", (p) => {
	p.on("initialSpawn", () => {
		let newpacket = new PacketBuilder("SendPlayers")
		.write("uint8", Game.fakePlayers.length)
		for (let fake of Game.fakePlayers) {
			newpacket.write("uint32", fake.netId)
			newpacket.write("string", fake.username)
			newpacket.write("uint32", 0)
			newpacket.write("uint8", 0)
			newpacket.write("uint8", 2)
		}
		newpacket.send(p.socket)
	})
})