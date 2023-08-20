Game.command("zombieoutfit", (p, args) => {
	if (Game.ADMINS.includes(p.userId)) {
		if (isNaN(args)) {
			Game.settings.zombieUseOutfit=true
		} else {
			Game.settings.zombieUseOutfit=false
			Game.settings.zombieId=parseInt(args)
		}
	}
})

Game.command("zombiemax", (p, args) => {
	if (Game.ADMINS.includes(p.userId)) {
		if (isNaN(args)) return Game.settings.maxZombies=25
		Game.settings.maxZombies=parseInt(args)
	}
})

Game.command("zombiespeed", (p, args) => {
	if (Game.ADMINS.includes(p.userId)) {
		if (isNaN(args)) return Game.settings.zombieSpeedMult=1
		Game.settings.zombieSpeedMult=parseFloat(args)
	}
})