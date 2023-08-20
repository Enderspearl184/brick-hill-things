const fs=getModule("fs")
var brickmodule = require("./add_remove_brick.js")

Game.command("load", async(p, slot=1) => {
	if (isNaN(parseInt(slot))) return p.message("The slot to load must be a number between 1-10.")
	if (parseInt(slot)>10 || parseInt(slot)<=0) return p.message("The slot to load must be a number between 1-10")
	readData(p, p.userId, slot)
})

function readData(p, userId, slot) {

	//read data file for user, with slot (to be used later)
	fs.readFile(`./playerData/${userId}_slot${slot}.sav`, async function(err, data) {
		if (data==undefined) return p.message("No save data found. Your build has not been cleared.")

		p.message("Clearing your bricks to replace with your saved build!")
	
		if (p.bricks.length) {
			await Game.deleteBricks(p.bricks)
			p.bricks=[]
		}

		p.message("Finished clearing the plot.")

		let LoadBricks = JSON.parse(data)
		console.log("Loading the data of " + p.username)
		p.message("Loading your saved data. This may take a little while if there are a lot of bricks!")
		
		let brickarray=[] //to do Game.loadBricks()
		for (let bricks of LoadBricks) {
			let pos = new Vector3(bricks.position.x+(p.corner2.x),bricks.position.y+(p.corner2.y),bricks.position.z)
			let model=0
			let rot=0
			if (bricks.model) {
				model=bricks.model
			}
			if (bricks.rotation) {
				rot=bricks.rotation
			}
			visibility=bricks.visibility || 1
			let result = brickmodule.newbrick(p,pos,bricks.scale.x,rot,bricks.color,model,visibility,true)
			if (!result) {p.erroroccured=true} else {brickarray.push(result)}
		}
		await Game.loadBricks(brickarray) //loadbricks on the brick
		brickarray.forEach((brick) => { //make them not appear clickable 
			brickmodule.sendClickable(false, brick, "broadcast")
		})
		if (p.erroroccured) {
			p.message("Loaded save data. Some bricks were outside of the plot and weren't placed.")
			p.message("If your build is missing, message Enderspearl184(tag)1841 on Discord,")
			p.message("and don't save over it until you get a response from me.")
			p.message("I'll probably be able to recover your build for you, if it hasn't been saved over.")
			return p.erroroccured=false
		}
		return p.message("Finished loading saved data.")
	});
}