const allowedplayers=[305122, 37] //add id here
var slock=false

Game.command("slock", (p) => {
	if (!allowedplayers.includes(p.userId)) return p.message("You aren't allowed to do this.")
	if (!slock) {
		slock=true
		p.message("locked server")
	} else {
		slock=false
		p.message("unlocked server")
	}
	
})

Game.on("playerJoin", (p) => {
	p.on("initialSpawn", () => {
		if (p.admin) allowedplayers.push(p.userId)
		if (slock==true && !allowedplayers.includes(p.userId)) {
				p.kick("Sorry, the server is locked right now.")
		}
	})
})