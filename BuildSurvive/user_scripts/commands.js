Game.command("zombieoutfit", (p, args) => {
	if (Game.ADMINS.includes(p.userId)) {
		args = parseInt(args)
		if (!isFinite(args) || args==0) {
			Game.settings.zombieUseOutfit=true
			p.message("Zombie outfits disabled for new zombies.")
		} else {
			p.message("Zombie outfits enabled for new zombies.")
			Game.settings.zombieUseOutfit=false
			Game.settings.zombieId=args
		}
	} else {
		p.message("You don't have permission to run this command!")
	}
})

Game.command("time", (p, args) => {
	if (Game.ADMINS.includes(p.userId)) {
		let split = args.split(" ")
		let time
		if (split[1] && isFinite(split[1])) {
			time=parseInt(split[1])
		} else {
			return p.message("Malformed command arguments. (Invalid Time)")
		}
		if (args[0]=="day") {
			Game.settings.maxDay=(time||90)
			p.message("Set max day timer.")
		} else if (args[0]=="night") {
			Game.settings.maxNight=(time||120)
			p.message("Set max night timer.")
		} else {
			p.message("Malformed command arguments. (Invalid Selection)")
		}
	} else {
		p.message("You don't have permission to run this command!")
	}
})

Game.command("zombiemax", (p, args) => {
	if (Game.ADMINS.includes(p.userId)) {
		args=parseInt(args)
		if (!isFinite(args)) return p.message("Malformed command arguments. (Invalid maximum)")
		Game.settings.maxZombies=args
		p.message("Changed maximum zombie count.")
	} else {
		p.message("You don't have permission to run this command!")
	}
})

Game.command("zombiespeed", (p, args) => {
	if (Game.ADMINS.includes(p.userId)) {
		args=parseFloat(args)
		if (!isFinite(args)) return p.message("Malformed command arguments. (Invalid multiplier)")
		Game.settings.zombieSpeedMult=args
	} else {
		p.message("You don't have permission to run this command!")
	}
})

Game.command("brickmax", (p, args) => {
	if (Game.ADMINS.includes(p.userId)) {
		args=parseInt(args)
		if (!isFinite(args)) return p.message("Malformed command arguments. (Invalid number)")
		Game.settings.maxBricks = args
		for (let player of Game.players) {
			if (player.admin) {
				p.maxBricks=Infinity
			} else if (player.ownsTShirt) {
				p.maxBricks = args*2
			} else {
				p.maxBricks = args
			}
		}
		p.message("Successfully changed maximum brick count.")
	} else {
		p.message("You don't have permission to run this command!")
	}
})

Game.command("zombiefly", (p) =>{
	if (Game.ADMINS.includes(p.userId)) {
		Game.settings.allZombiesFly=!Game.settings.allZombiesFly
		p.message("Toggled flying for non-flying zombie types.")
	} else {
		p.message("You don't have permission to run this command!")
	}
})