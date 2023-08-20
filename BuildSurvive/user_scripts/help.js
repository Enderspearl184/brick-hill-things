

const helpCommands = [
	"/help (optional number) - View a page of commands",
	"/paint (hex colour code) - Change the colour of new bricks.",
	"/reset - Respawn yourself, incase you are stuck.",
	"/visibility (0-1) - Change the visibility of new bricks. 1 is fully visible, 0 is invisible.",
	"/model (optional item id) - Change the model of new bricks to a hat or head.",
	"/export - Export your current build to a .brk file."
]

const adminCommands = [
	"/zombieoutfit (optional id) - Changes new zombies to use a player's avatar, or the default outfit.",
	"/zombiemax (number) - Change the zombie limit. Existing zombies will not be removed if the cap is lowered.",
	"/zombiespeed (number) - Change the zombie speed multiplier",
	"/slock - Lock the server, so only admins can join.",
	"/time (day/night) (number) - Set the length of the day/night cycle.",
	"/brickmax (number) - Change the maximum brick count.",
	"/zombiefly - Toggle flying for non-flying zombie types."
]

Game.command("help", (p, page) => {
	page = parseInt(page)
	let help = helpCommands
	if (Game.ADMINS.includes(p.userId)) {
		help = ["/adminhelp (optional number) - List commands only admins can use."].concat(help)
	}
	if (!isFinite(page) || page>=1000000000 || page<=0) page=1
	p.message("-- Help Page " + page + "/" + Math.ceil(help.length/5) + " --")
	for (i=0+(5*(page-1)); i<=5*page;i++) {
		if (help[i]) p.message(help[i])
	}
	p.message("--------------------")
})

Game.command("adminhelp", (p, page) => {
	if (!Game.ADMINS.includes(p.userId)) return p.message("You don't have permission to use this command!")
	page = parseInt(page)
	let help = adminCommands
	if (Game.ADMINS.includes(p.userId)) {
		help = ["(All commands included in Cheat's Admin V2 are also available)","/adminhelp (optional number) - List commands only admins can use."].concat(help)
	}
	if (!isFinite(page) || page>=1000000000 || page<=0) page=1
	p.message("-- Help Page " + page + "/" + Math.ceil(help.length/5) + " --")
	for (i=0+(5*(page-1)); i<=5*page;i++) {
		if (help[i]) p.message(help[i])
	}
	p.message("--------------------")
})