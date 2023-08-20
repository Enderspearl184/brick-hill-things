//welcome to my terrible code

var mappath = "./maps/Home.brk" //set this to the map for the game

var maxbricks = 1000 //the maximum bricks in the mine that can exist before the mine resets
var maxheight = 0 //the maximum height bricks in the mine will generate at.

//self explanatory, but it contains the name of possible stones, the color, and the number (out of 1mil) that it has to roll higher than or equal to, and also the depth it will appear below
//IF MODIFYING THIS MAKE SURE ITS ORDERED LOWEST NUM TO HIGHEST OR IT WILL NOT WORK
var droprate = [
	{
		name:"stone",
		color:"#3d3d3d",
		num:0, //if it rolls between 0-799,999 it becomes stone
		depth:0
	},
	{
		name:"coal",
		color:"#1a1a1a",
		num:800000, //if it rolls between 800k and 899,999 it becomes coal
		depth:0, //min depth it appears at
		depthmax:-500 //max depth it appears at (optional)
	},
	{
		name:"gold",
		color:"#D4AF37",
		num:925000, //between 925k and 949,999
		depth:-100
	},
	{
		name:"ruby",
		color:"#E0115F",
		num:950000, //between 950k and 979,999
		depth:-200
	},
	{
		name:"diamond",
		color:"#b9f2ff",
		num:980000, //between 980k and 999,998
		depth:-300
	},
	{
		name:"uranium",
		color:"#E0FF66",
		num:9999999, //between 999,999 and 1mil
		depth:-500
	}
]

var minebricks = [
]

var brickcount=0

//this function picks what brick should be placed and then places it. mo
function generateBrick(vector3) {
	//pick random between 1/1000000
	let rand = random(1000000)
	//console.log(rand)

	//if it somehow bugs out generate stone instead
	let randitem="stone"
	let randcolor="#3d3d3d"


	for (let item of droprate) {
		if (item.num<=rand && vector3.z<=item.depth && (!item.depthmax || vector3.z>=item.depthmax)) {
			randitem=item.name
			randcolor=item.color
		}
	}
	if (randitem && randcolor) {
		let brick = new Brick(vector3, new Vector3(6,6,6), randcolor)
		brick.name=`mine_${randitem}`
		return Game.newBrick(brick)
	} else console.error("no random brick/color was found, how did this happen?")
}

function mineBrick(brick) {
	//minebricks.push(brick.position)
	brick.destroy()
	brickcount--
	
	//check side variables
	let xpos = true
	let m_xpos = true
	let ypos = true
	let m_ypos = true
	let zpos = true
	let m_zpos = true

	//checking if sides are clear
	minebricks.forEach((pos) => {
		if ((pos.x==brick.position.x+6 && pos.y==brick.position.y && pos.z==brick.position.z) || (brick.position.z>=0)) {
			xpos=false
		} else if ((pos.x==brick.position.x-6 && pos.y==brick.position.y && pos.z==brick.position.z) || (brick.position.z>=maxheight)) {
			m_xpos=false
		} else if ((pos.x==brick.position.x && pos.y==brick.position.y+6 && pos.z==brick.position.z) || (brick.position.z>=maxheight)) {
			ypos=false
		} else if ((pos.x==brick.position.x && pos.y==brick.position.y-6 && pos.z==brick.position.z) || (brick.position.z>=maxheight)) {
			m_ypos=false
		} else if ((pos.x==brick.position.x && pos.y==brick.position.y && pos.z==brick.position.z+6) || (brick.position.z+6>=maxheight)) {
			zpos=false
		} else if ((pos.x==brick.position.x && pos.y==brick.position.y && pos.z==brick.position.z-6) || (brick.position.z-6>=maxheight)) {
			m_zpos=false
		}
	})

	//generating bricks
	if (xpos) {
		generateBrick(new Vector3(brick.position.x+6, brick.position.y, brick.position.z))
	}
	if (m_xpos) {
		generateBrick(new Vector3(brick.position.x-6, brick.position.y, brick.position.z))
	}
	if (ypos) {
		generateBrick(new Vector3(brick.position.x, brick.position.y+6, brick.position.z))
	}
	if (m_ypos) {
		generateBrick(new Vector3(brick.position.x, brick.position.y-6, brick.position.z))
	}
	if (zpos) {
		generateBrick(new Vector3(brick.position.x, brick.position.y, brick.position.z+6))
	}
	if (m_zpos) {
		generateBrick(new Vector3(brick.position.x, brick.position.y, brick.position.z-6))
	}
}

//generate the random number lol
function random(max) {
	return Math.floor(Math.random() * max) + 1 
}

//reset the map
async function resetmap() {
	Game.messageAll("Resetting mines...")
	brickcount=0
	world.bricks.forEach((brick) => {
		if (!brick.name || brick.name.startsWith("mine")) {
			brick.destroy()
		}
	})
	minebricks=[]
	await Game.loadBrk(mappath)
	Game.players.forEach((player) => {
		player.respawn()
	})
}


//reset map command only I can use
Game.command("resetmap", (p) => {
	if (p.userId==305122) {
		resetmap()
	}
})

setInterval(async function() {
	for (let bricks of world.bricks) {
		//so no bricks can exist above the baseplate
		if (bricks.name && bricks.name.startsWith("mine") && bricks.position.z>=0 && bricks.destroyed==false) {
			bricks.destroy()
		}

		//make bricks clickable and stuff
		if (bricks.name && bricks.name.startsWith("mine") && bricks.clickable==false && bricks.destroyed==false) {
			brickcount++
			minebricks.push(bricks.position)
			bricks.clickDistance=300
			bricks.clicked((player,secure) => {
				if (secure) {
					mineBrick(bricks)
				}
			})
		}
	}

	//resets map if mine bricks exceeds the maximum
	if (brickcount>=maxbricks) {	
		resetmap()
	}
}, 100)