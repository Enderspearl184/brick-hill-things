world.bricks.forEach(brick => { // Every brick in the world
	let split = brick.name.split(" ")
	if (split.length>=3) { //because spaces in usernames
		let id=split[0]
		split.splice(0,1)
		split=[id, split.join(" ")]
	}
	const id = split[0]
	const username = split[1]
	const message = `This is brick ${brick.name.split[0]}`
	brick.clicked((player) => {
		if (username) {
			player.centerPrint(`Brick \\c1${id} \\c0is owned by\\c1 ${username}`)
		} else {
			player.centerPrint(`Brick \\c1${id}`)
		}
	})
	brick.clickDistance = 999999 // Infinite client range
})

Game.on("initialSpawn", (p) => {
	let ownedBricks=0
	for (let brick of world.bricks) {
		let split=brick.name.split(" ")
		if (split.length!==1) {
			if (split.length>=3) { //because spaces in usernames
				let id=split[0]
				split.splice(0,1)
				split=[id, split.join(" ")]
			}
			if (split[1].toLowerCase()==p.username.toLowerCase()) {
				ownedBricks++
			}
		}
	}
	p.setScore(ownedBricks)
})