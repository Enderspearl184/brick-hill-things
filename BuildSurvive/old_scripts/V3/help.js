Game.command("help", (p,admin) => {
	if (admin!=="admin" || !Game.ADMINS.includes(p.userId)) {
	p.message("======= Commands =======")
	p.message("/help - shows these commands. This would be a lot more useful with more commands.")
	p.message("/paint (hex colour code) - change the colour of new bricks.")
	p.message("/reset - respawn yourself.")
	p.message("/visibility - change the visibility of new bricks. value is between 0-1.")
	p.message("/model - allows you to place hat, tool, and head models!")
	if (Game.ADMINS.includes(p.userId)) p.message("/help admin - shows commands only admins can use!")
	p.message("========================")
	} else if (admin=="admin" && Game.ADMINS.includes(p.userId)) {
	p.message("======= Admin Commands =======")
	p.message("/help admin - shows these admin commands.")
	p.message("/zombieoutfit (optional id) - changes the zombie outfit to a user id, or back to normal.")
	p.message("/zombiemax (optional amount) - changes the limit for how many zombies that can exist at once.")
	p.message("/zombiespeed (optional speed) - lets you change the zombie speed.")
	p.message("/slock - locks the server to only admins.")
	p.message("==============================")
	}
})