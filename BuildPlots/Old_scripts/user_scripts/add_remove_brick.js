var brickmodule = {
	newbrick: function(player, pos, scale, rot=0, colour="#f54242", model=0, visibility=1,batch) {
		if (brickmodule.isInBounds(player, pos, new Vector3(scale,scale,scale))) {
			//set brick variables
			var brick = new Brick(pos, new Vector3(scale,scale,scale), colour)
			brick.visibility=visibility
			brick.setRotation(rot)
			brick.setModel(model)
			brick.placedBy=player.userId
			player.bricks.push(brick)
			brick.clicked((p) => {
				if (brick.placedBy==p.userId) {
					brickmodule.removebrick(p, brick)
				}
			})
			if (!batch) { //if it is being loaded do this instead
				Game.newBrick(brick)
				setTimeout(function() {
					brickmodule.sendClickable(false, brick, "broadcast")
				}, 100)
			}
			return brick
		} else return false
	},
	removebrick: function(player, brick, force) {
		if (force || brick.placedBy==player.userId || player.buildcore==brick) {
			if (player.bricks.includes(brick)) player.bricks.splice(player.bricks.indexOf(brick), 1)
			if (brick.collision==true) brick.setCollision(false)
			brick.setPosition(new Vector3(999,999,999))
			if (brick.destroyed==false) brick.destroy()
			Game.deleteBricks([brick])
		}
	},
	isInBounds: function(p, position, scale) {
		if (position.x < p.plate.corner1.x || position.x > p.plate.corner2.x || position.y < p.plate.corner1.y || position.y > p.plate.corner2.y) return false
		if (position.x+scale.x-1 < p.plate.corner1.x || position.x+scale.x-1 > p.plate.corner2.x || position.y+scale.y-1 < p.plate.corner1.y || position.y+scale.y-1 > p.plate.corner2.y) return false
		return true
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