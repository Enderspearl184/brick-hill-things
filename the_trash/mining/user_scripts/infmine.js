const invmodule = require('./inventorymodule')

var mappath = "./maps/Home.brk" //set this to the map for the game

var maxbricks = 50000 //the maximum bricks in the mine that can exist before the mine resets
var maxheight = 0 //the maximum height bricks in the mine will generate at.

//self explanatory, but it contains the name of possible stones, the color, and the number (out of 1mil) that it has to roll higher than or equal to, and also the depth it will appear below
//IF MODIFYING THIS MAKE SURE ITS ORDERED LOWEST NUM TO HIGHEST OR IT WILL NOT WORK
var droprate = [
	{
		name:"Stone",
		color:"#3d3d3d",
		num:0, //if it rolls between 0-799,999 it becomes stone
		depth:0,
		durability:5
	},
	{
		name:"Coal",
		color:"#1a1a1a",
		num:800000,
		depth:-3, //min depth it appears at
		durability:15
	},
	{
		name:"Iron",
		color:"#bdb1a6",
		num:850000,
		depth:-3, //min depth it appears at
		durability:25
	},
	{
		name:"Sapphire",
		color:"#0000ff",
		num:900000,
		depth:-100,
		deptmax:-350,
		durability:75
	},
	{
		name:"Gold",
		color:"#D4AF37",
		num:925000,
		depth:-10,
		durability:50
	},
	{
		name:"Ruby",
		color:"#E0115F",
		num:950000, //between 950k and 979,999
		depth:-200,
		depthmax:-540,
		durability:100
	},
	{
		name:"Diamond",
		color:"#b9f2ff",
		num:980000, //between 980k and 999,998
		depth:-300,
		depthmax:-800,
		durability:150
	},
	{
		name:"Uranium",
		color:"#E0FF66",
		num:9999999, //between 999,999 and 1mil
		depth:-500,
		durability:500
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
		if (item.num<=rand && vector3.z<=item.depth*6 && (!item.depthmax || vector3.z>=item.depthmax*6)) {
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


//some REALLY long if statements to get brick AND tool durability and break tools
function clickBrick(brick, p) {
	let brickname = brick.name.split("_")[1]
	let bricktype = droprate.find((type) => type.name==brickname)
	if (!brick.durability) brick.durability=bricktype.durability+Math.floor(((brick.position.z*-1)/6)/25)
	if (p.toolEquipped && p.pickaxes.equippedPick.Strength>=brick.durability) {
		if (!p.pickaxes.equippedPick.Unbreakable && (!p.pickaxes.equippedPick.Durability || p.pickaxes.equippedPick.Durability<=1)) {
			delete p.pickaxes.Pickaxes[p.pickaxes.equippedPick.type]
			p.pickaxes.equippedPick={}
			p.destroyTool(p.toolEquipped)
			p.message("Oh no! Your pickaxe has broken! Return to the surface with /reset")
		} 
		if (p.pickaxes.equippedPick && !p.pickaxes.equippedPick.Unbreakable) {
			p.pickaxes.equippedPick.Durability-=1
			p.pickaxes.Pickaxes[p.pickaxes.equippedPick.type].Durability-=1
			if (p.pickaxes.equippedPick.Durability==5 && !p.pickaxes.equippedPick.Unbreakable) {
				p.message("Your pickaxe is about to break!")
			}
		}
		return mineBrick(brick,p)
	} else if (p.toolEquipped && p.pickaxes.equippedPick.Strength) {
		brick.durability-=p.pickaxes.equippedPick.Strength
	}
	p.centerPrint(brickname + " - Durability: " + brick.durability, 1)
}

function mineBrick(brick, p) {
	//minebricks.push(brick.position)
	brick.destroy()
	brickcount--

	let brickname = brick.name.split("_")
	let itemname = brickname[1]
	invmodule.addItem(p, itemname, 1)
	
	//check side variables
	let xpos = true
	let m_xpos = true
	let ypos = true
	let m_ypos = true
	let zpos = true
	let m_zpos = true

	//fix
	if (brick.position.z+6>=maxheight) zpos=false

	//checking if sides are clear
	minebricks.forEach((pos) => {
		if (pos.x==brick.position.x+6 && pos.y==brick.position.y && pos.z==brick.position.z) {
			xpos=false
		} else if (pos.x==brick.position.x-6 && pos.y==brick.position.y && pos.z==brick.position.z) {
			m_xpos=false
		} else if (pos.x==brick.position.x && pos.y==brick.position.y+6 && pos.z==brick.position.z) {
			ypos=false
		} else if (pos.x==brick.position.x && pos.y==brick.position.y-6 && pos.z==brick.position.z) {
			m_ypos=false
		} else if (pos.x==brick.position.x && pos.y==brick.position.y && pos.z==brick.position.z+6) {
			zpos=false
		} else if (pos.x==brick.position.x && pos.y==brick.position.y && pos.z==brick.position.z-6) {
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
	if (p.userId==305122 || Game.local) {
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
					clickBrick(bricks, player)
				}
			})
		}
	}

	//resets map if mine bricks exceeds the maximum
	if (brickcount>=maxbricks) {	
		resetmap()
	}
}, 100)