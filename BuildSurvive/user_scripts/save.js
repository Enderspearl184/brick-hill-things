const fs=getModule("fs")
Game.command("save", async (p, slot=1) => {
	if (isNaN(parseInt(slot))) return p.message("The slot to save must be a number between 1-10.")
	if (parseInt(slot)>10 || parseInt(slot)<=0) return p.message("The slot to save must be a number between 1-10")
	p.message("Saving data... This will take a little.")
	let SaveBricks=[]
	for (let bricks of world.bricks) {
		if (bricks.placedBy==p.userId && bricks.destroyed==false) {

			//not using the brick directly for the save, but instead an object and setting the main properties to the brick's. add more when necessary
			let BrickSave = {}
			BrickSave.position= await new Vector3(bricks.position.x-(p.corner2.x),bricks.position.y-(p.corner2.y),bricks.position.z)
			BrickSave.scale=await bricks.scale
			BrickSave.color=await bricks.color
			BrickSave.model=await bricks.model
			BrickSave.rotation=await bricks.rotation
			BrickSave.visibility=await bricks.visibility

			//await sleep(1)

			SaveBricks.push(BrickSave)
		}
	}
	writeData(p, SaveBricks, slot)
	//for (let bricks of SaveBricks) {
		//bricks.position=new Vector3(bricks.position.x+(p.plate.corner2.x),bricks.position.y+(p.plate.corner2.y),bricks.position.z)
	//}
})
	

function writeData(p, data, slot) {
	//save data to "userid_slot(1-10).sav" as slots have been added!
	fs.writeFile(`./playerData/${p.userId}_slot${slot}.sav`,JSON.stringify(data), function (err) {
		if (err) throw err;
		console.log('Data Saved!');
		p.message("Data Saved!")
	});
}