const allowedplayers=[305122, 37] //add id here
//var slock=false

Game.command("slock", (p) => {
	if (!allowedplayers.includes(p.userId)) return p.message("You don't have permission to run this command!")
	if (!slock) {
		Game.settings.serverLock=true
		p.message("Server locked to only admins.")
	} else {
		slock=false
		p.message("Server unlocked.")
	}
	
})

Game.on("playerJoin", (p) => {
	p.on("initialSpawn", () => {
		if (p.admin && !allowedplayers.includes(p.userId)) allowedplayers.push(p.userId)
		if (Game.settings.serverLock==true && !allowedplayers.includes(p.userId)) {
				p.kick("Sorry, the server is locked right now.")
		}
	})
})