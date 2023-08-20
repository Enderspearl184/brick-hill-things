if (Game.local) console.log("GAME IS BEING RUN LOCAL, DON'T MAKE THE MISTAKE OF THINKING IT ISN'T")

const trademodule=require('./BrickHillTradeValueApiV2.js')
const visitmodule=require('./GameVisitCount.js')


Date.prototype.yyyymmdd = function() {
  var mm = this.getMonth() + 1; // getMonth() is zero-based
  var dd = this.getDate();

  return [this.getFullYear(),
          (mm>9 ? '' : '0') + mm,
          (dd>9 ? '' : '0') + dd
         ].join('/');
};

function random(min, max) {
	return min + Math.random() * (max - min);
}

var date = new Date();

const currentdate = date.yyyymmdd()
const year = currentdate.split("/")[0]
const month = currentdate.split("/")[1]
const day = currentdate.split("/")[2]
const Today = month + "/" + day + "/" + year

const VisitTowerLevels = [100,500,1000,1500,2500,4000]
const ValueTowerLevels = [0.1,1,10,100,500]

Game.on("initialSpawn", async(player) => {
	init(player)
})

async function init(player,collide=false) {
	try {
		player.UserInfo = await player.getUserInfo()
		doBasicTower(player,collide) //handles the age tower
		doMintBox(player,collide) //handles the mint box
		doMemberBox(player,collide) //handles the membership tower
		doLuckBox(player,collide) //handles the 1/1000 chance box
		doAdminBox(player,collide) //handles the admin box
		doBrickSaintBox(player,collide) //handles the brick saint box
		doValueTower(player,collide) //rip bht! //handles the value tower and the brick-hill.trade data
		doVisitTower(player,collide) //handles the game visit tower
	} catch (err) {
		console.error(err)
		init(player,collide)
	}
}

async function doBasicTower(player,collide=false) {
	//TODO: this is actually stupid
	let JoinDate = player.UserInfo.created_at
	let DateOnly = JoinDate.split(" ")[0]
	let Date1 = DateOnly.split("-")[1]
	let Date2 = DateOnly.split("-")[2]
	player.Date3 = DateOnly.split("-")[0]
	let TrueDate = Date1 + "-" + Date2 + "-" + player.Date3
	player.JoinDate = TrueDate.replace(/-/g, "/")
	let date1 = new Date(player.JoinDate);
	let date2 = new Date(Today);
	let diffTime = Math.abs(date2 - date1);
	player.AccountAge = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

	//logging stuff to console for if debugging is needed.
	console.log(player.JoinDate)
	player.setScore(player.AccountAge)
	console.log(player.AccountAge)
	
	player.TestMembership=player.membershipType
	
	//puts me on owner team and allows me to access entire tower
	if (player.userId==305122 || player.userId==1) {
		player.setTeam(world.teams.find(team => team.name == "Owner"))
		player.TestMembership = 4
		player.Date3=2016
	} else {
		player.setTeam(world.teams.find(team => team.name == player.Date3))
	}

	//sending message for what part of the tower they can enter
	if (player.Date3==2022 && collide==false) {
		player.message("Since you joined in 2022, you don't have access to the tower.")
	} else if (player.Date3>2016 && collide==false) {
		player.message("You have access to the " + player.Date3 + " level of the tower!")
	} else if (collide==false) {
		player.message("You have access to the ENTIRE tower!")
	}

	//actually allowing them in the tower
	for (i=player.Date3; i<date.getFullYear(); i++) {
		writeBoxPacket(player, i,collide)
	}
}

async function doBrickSaintBox(player,collide=false) {
	player.Awards = player.UserInfo.awards 

	//checks if user is a brick saint.
	if (player.Awards.some(item => item.award_id == 5)) {
		writeBoxPacket(player, "Saint",collide)
		console.log("Player is a Brick Saint")
	}
}

function doAdminBox(player,collide=false) {
	// checks if user is a Brick Hill admin
	if (player.admin) {
		writeBoxPacket(player, "Admin",collide)
		console.log("Player is a Brick Hill admin")
	}
}

function doMemberBox(player,collide=false) {
	//checks if user is me or has a membership
	if (player.userId==305122) player.TestMembership = 4
	if (player.TestMembership>2) {
		console.log("Player has membership")
		for (i=3; i<=player.TestMembership; i++) {
			writeBoxPacket(player, `Member${i}`,collide)
		}
	}
}

function doLuckBox(player,collide=false) {
	//random 1/1000 chance to let player in White Box
	if (!player.rand) {
		player.rand=Math.floor(random(1,1001))
	}
	if (player.rand==1000 || player.userId==305122 || Game.local || player.Lucky) {
		player.Lucky=true
		writeBoxPacket(player, "Random",collide)
		console.log("Player got lucky")
	} else {
		console.log("Player didn't get lucky. Random number is " + player.rand)
	}
}

async function doMintBox(player,collide=false) {
	//setting if player has/had mint
	if ((await player.ownsAsset(30542)) || (await player.ownsAsset(522)) || player.TestMembership==2) {
		player.Mint=true
		writeBoxPacket(player, "Member2",collide)
	}
}

async function doVisitTower(player,collide=false) {
	await visitmodule(player)
	
	for (let visitcount of VisitTowerLevels) {
		if (player.gameVisits>=visitcount) {
			writeBoxPacket(player, `${visitcount}Visits`,collide)
		}
	}
}

async function doValueTower(player) {
	await trademodule(player,collide=false)

	//checks brick-hill.trade value and allows player in boxes accordingly
	if (player.NoTradeInfo==false) {
		console.log("Successfully retrieved brick-hill.trade data!")

		player.playerValue = (player.TradeInfo.value/1000)

		console.log(player.playerValue)

		if (player.playerValue<0.1) player.message("You can't access the Green Tower as you don't have enough value.")

		for (let valueCount of ValueTowerLevels) {
			if (player.playerValue>=valueCount) {
				writeBoxPacket(player, `${visitcount}kValue`,collide)
			}
		}
		//if (player.playerValue>=1000) player.playerValue=1000
		//for (i=0.1; i<=player.playerValue; i*=10) {
		//	writeBoxPacket(player, `${i}kValue`,collide)
		//}
	} else player.message("Failed to retrieve value data.")
}

function writeBoxPacket(p,y,collide=false) {

	//sends packet to player to make the brick not have collision

	for (let bricks of world.bricks) {
		if (bricks.name===`${y}Brick`) {
			brickPacket = new PacketBuilder("Brick")
				.write("uint32", bricks.netId)
				.write("string", "collide")
				.write("bool", collide)
			brickPacket.send(p.socket)
		}
	}

	//send a message to the player saying what part of the tower they can enter.

	if (y=="0.1kValue" && collide==false) {
		if (p.playerValue>=1) return
		console.log("user has 100 value")
		return p.message("You have access to the 100 Value level of the Green Tower!")
	}
	
	if (y=="1kValue" && collide==false) {
		if (p.playerValue>=10) return
		console.log("user has 1k+ value")
		return p.message("You have access to the 1k Value level of the Green Tower!")
	}
	
	if (y=="10kValue" && collide==false) {
		if (p.playerValue>=100) return
		console.log("user has 10k+ value")
		return p.message("You have access to the 10k Value level of the Green Tower!")
	}

	if (y=="100kValue" && collide==false) {
		if (p.playerValue>=500) return
		console.log("user has 100k+ value")
		return p.message("You have access to the 100k Value level of the Green Tower!")
	}
	
	if (y=="500kValue" && collide==false) {
		console.log("user has 500k+ value")
		return p.message ("You have access to the ENTIRE Green Tower!!!")
	}

	if (y=="100Visits" && collide==false) {
		if (p.gameVisits>=500) return
		return p.message("You have access to the 100 Visits level of the Blue Tower!")
	}

	if (y=="500Visits" && collide==false) {
		if (p.gameVisits>=1000) return
		return p.message("You have access to the 500 Visits level of the Blue Tower!")
	}

	if (y=="1000Visits" && collide==false) {
		if (p.gameVisits>=1500) return
		return p.message("You have access to the 1000 Visits level of the Blue Tower!")
	}

	if (y=="1500Visits" && collide==false) {
		if (p.gameVisits>=2500) return
		return p.message("You have access to the 1500 Visits level of the Blue Tower!")
	}


	if (y=="2500Visits" && collide==false) {
		if (p.gameVisits>=4000) return
		return p.message("You have access to the 2500 Visits level of the Blue Tower!")
	}


	if (y=="4000Visits" && collide==false) {
		return p.message("You have access to the 4000 Visits level of the Blue Tower!")
	}
	
	if (y=="Member2" && collide==false) {
		return p.message("You have access to the Mint Box because you had a Mint membership before it was removed.")
	}
	
	if (y=="Member3" && collide==false) {	
		if (p.TestMembership!==3) return
		return p.message("You have access to the Ace level of the Small Tower!")
	}

	if (y=="Member4" && collide==false) {
		if (p.TestMembership!==4) return
		return p.message("You have access to the ENTIRE Small Tower!!")
	}

	if (y=="Saint" && collide==false) {
		p.message("Since you have the Brick Saint award, you have access to the Golden Box!")
	}  

	if (y=="Admin" && collide==false) {
		p.message("Since you are a Brick Hill admin, you have access to the Pink Box!")
		return
	}

	if (y=="Random" && collide==false) {
		return p.message("You hit the 1/1000 chance and can enter the White Box!")
	}

	return
}

Game.command("reload", async(player) => {
	player.message("-------Reloading Player Data. Please Wait...-------")
	await init(player,true)
	await init(player,false)
})