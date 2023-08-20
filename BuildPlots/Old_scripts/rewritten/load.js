var brickmodule = require("./add_remove_brick.js")

Game.command("load", async(p, id) => {
	if (id!=="load" && (p.userId==305122 || Game.local)) {
		readData(p, id, 1)
	} else readData(p, p.userId, 1)
})

function readData(p, userId, slot) {

	//read data file for user, with slot (to be used later)
	fs.readFile(`./playerData/${userId}_slot${slot}.sav`, async function(err, data) {
		if (data==undefined) return p.message("No save data found. Your build has not been cleared.")

		p.message("Clearing your bricks to replace with your saved build!")

		world.bricks.forEach((brick) => {
			if (brick.placedBy==p.userId) {
				brickmodule.removebrick(p, brick, true)
			}
		})

		p.message("Finished clearing the plot.")

		let LoadBricks = JSON.parse(data)
		console.log("Loading the data of " + p.username)
		p.message("Loading your Saved Data.")
	
		for (let bricks of LoadBricks) {
			await sleep(5)
			let pos = new Vector3(bricks.position.x+(p.plate.corner2.x),bricks.position.y+(p.plate.corner2.y),bricks.position.z)
			let model=0
			let rot=0
			if (bricks.model) {
				model=bricks.model
			}
			if (bricks.rotation) {
				rot=bricks.rotation
			}
			let result = brickmodule.newbrick(p,pos,bricks.scale.x,rot,bricks.color,model)
			if (!result) p.erroroccured=true
		}
		if (p.erroroccured) {
			p.message("Loaded save data. Some bricks were outside of the plot and weren't placed.")
			p.message("If your build is missing, message Enderspearl184(tag)1841 on Discord,")
			p.message("and don't save over it until you get a response from me.")
			p.message("I'll probably be able to recover your build for you, if it hasn't been saved over.")
			return p.erroroccured=false
		}
		return p.message("Finished loading saved data. Equip and unequip the delete tool if blocks show the clickable icon.")
	});
}