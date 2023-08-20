//sets player brick model if they own the t shirt
Game.command("model", (p,id) => {
	if (p.ownsModelTShirt!==true && Game.local==false) {
		p.message("You need the /model T-Shirt to use this.")
		p.message("You can find the T-Shirt in the description")
	} else return p.model=parseInt(id)
})