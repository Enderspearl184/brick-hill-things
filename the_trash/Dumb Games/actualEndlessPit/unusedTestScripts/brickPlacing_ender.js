var ownedBricks = []

async function pushObj(brick, split) {
	try {
		let info=await Game.getUserInfo(split[1])
		let username=info.username
		let obj={userId:split[1],owned:1,username:username}
		ownedBricks.push(obj)
		return obj
	} catch (err) {
		console.warn(err)
		pushObj(brick, split)
	}
}

async function init() {
	for (let brick of world.bricks) {
		let brickObj
		let split=brick.name.split(" ")
		if (split[0]!==brick.name) {
			brickObj=ownedBricks.find((obj)=>obj.userId==parseInt(split[1]))
			if (brickObj) {
				brickObj.owned++
			} else {
				brickObj=await pushObj(brick,split)
			}
		}
		brick.setClickable(true, 999999)
		brick.clicked((p)=>{
			if (brickObj) {
				p.centerPrint(`Brick ${split[0]} is owned by ${brickObj.username}`,3)
			} else {
				p.centerPrint(`Brick ${split[0]}`,3)
			}
		})
	}
}

init()

Game.on("initialSpawn", (p)=>{
	let brickObj=ownedBricks.find((obj)=>obj.userId==p.userId)
	if (brickObj) {
		p.setScore(brickObj.owned)
	}
})