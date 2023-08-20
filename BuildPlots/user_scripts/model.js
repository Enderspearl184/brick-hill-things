const filePath="./../SharedJSON/blockList.json"
const fs=getModule("fs")
//sets player brick model if they own the t shirt
Game.command("model", (p,id) => {
	if (p.ownsModelTShirt!==true && Game.local==false) {
		p.message("You need the /model T-Shirt to use this.")
		p.message("You can find the T-Shirt in the description")
	} else {
		console.log("/model " + id)
		let model = parseInt(id)
		let blockList;
		try {
			blockList = JSON.parse(fs.readFileSync(filePath))
		} catch (err) {
			console.error(err)
			blockList="error"
		}
		console.log("loaded blocklist")
		if (blockList=="error") {
			return p.message("Failed to load mesh blocklist")
		}
		if (blockList.includes(model)) {
			return p.message("no dont")
		}
		return p.model=model
	}
})