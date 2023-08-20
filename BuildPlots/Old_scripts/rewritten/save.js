Game.command("save", async (p) => {
	p.message("Saving data... This will take a little, to prevent errors from messing with your build.")
	let SaveBricks=[]
	for (let bricks of world.bricks) {
		if (bricks.placedBy==p.userId && bricks.destroyed==false) {

			//not using the brick directly for the save, but instead an object and setting the main properties to the brick's. add more when necessary
			let BrickSave = {}
			BrickSave.position= await new Vector3(bricks.position.x-(p.plate.corner2.x),bricks.position.y-(p.plate.corner2.y),bricks.position.z)
			BrickSave.scale=await bricks.scale
			BrickSave.color=await bricks.color
			BrickSave.posRecover = await p.plate.corner2
			BrickSave.model=await bricks.model
			BrickSave.rotation=await bricks.rotation

			//wait a little to prevent the player's build from getting messed up.
			await sleep(5)

			SaveBricks.push(BrickSave)
		}
	}
	writeData(p, SaveBricks, 1)
	//for (let bricks of SaveBricks) {
		//bricks.position=new Vector3(bricks.position.x+(p.plate.corner2.x),bricks.position.y+(p.plate.corner2.y),bricks.position.z)
	//}
})
	

function writeData(p, data, slot) {
	//save data to "userid_slot1.sav" slots will be added sometime...
	fs.writeFile(`./playerData/${p.userId}_slot${slot}.sav`,JSON.stringify(data), function (err) {
		if (err) throw err;
		console.log('Data Saved!');
		p.message("Data Saved!")
	});
}