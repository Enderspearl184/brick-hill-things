var brickmodule = {
	newbrick: function(player, pos, scale, rot=0, colour="#f54242", model=0) {
		//set brick variables
		var brick = new Brick(pos, new Vector3(scale,scale,scale), colour)
		brick.visibility=1
		brick.setRotation(rot)
		brick.setModel(model)
		brick.placedBy=player.userId
		player.bricks.push(brick)
		brick.clicked((p) => {
			if (brick.placedBy) {
				brickmodule.removebrick(p, brick)
			}
		})
		Game.newBrick(brick)
		setTimeout(function() {
			//Game.newBrick(brick)
			brickmodule.sendClickable(false, brick, "broadcast")
		}, 100)
		return brick
	},
	removebrick: function(player, brick, force) {
		if (player.bricks.includes(brick)) player.bricks.splice(player.bricks.indexOf(brick), 1)
		if (brick.collision==true) brick.setCollision(false)
		brick.setPosition(new Vector3(999,999,999))
		if (brick.destroyed==false) brick.destroy()
		Game.deleteBricks([brick])
	},
	sendClickable: function(canClick, brick, p) {
		let brickPacket = new PacketBuilder("Brick")
		.write("uint32", brick.netId)
		.write("string", "clickable")
		.write("bool", canClick)
		.write("uint32", 1000000)
		if (p!=="broadcast") {
			brickPacket.send(p.socket)
		} else brickPacket.broadcast()
	}
}

module.exports = brickmodule