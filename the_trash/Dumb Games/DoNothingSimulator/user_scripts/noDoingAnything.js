Game.on("initialSpawn", (p) => {
	p.keypress(() => {
		p.kick("no doing anything, so no keyboard for you. you lasted " + p.score + " seconds")
	})
	p.mouseclick(() => {
		p.kick("no doing anything, so no clicking. you lasted " + p.score + " seconds")
	})
	p.on("chatted", () => {
		p.kick("no doing anything, that means talking. you lasted " + p.score + " seconds")
	})
	p.on("died", () => {
		p.kick("no doing anything, that means dying. you lasted " + p.score + " seconds")
	})
})

Game.on("playerLeave", (p) => {
	Game.messageAll(p.username + " lasted " + p.score + " seconds, but got kicked.")
	console.log(p.username + " lasted " + p.score + " seconds, but got kicked.")
})