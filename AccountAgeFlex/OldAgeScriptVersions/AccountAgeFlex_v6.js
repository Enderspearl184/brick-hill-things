if (Game.local) console.log("GAME IS BEING RUN LOCAL, DON'T MAKE THE MISTAKE OF THINKING IT ISN'T")

Date.prototype.yyyymmdd = function() {
  var mm = this.getMonth() + 1; // getMonth() is zero-based
  var dd = this.getDate();

  return [this.getFullYear(),
          (mm>9 ? '' : '0') + mm,
          (dd>9 ? '' : '0') + dd
         ].join('/');
};

var date = new Date();

const currentdate = date.yyyymmdd()
const year = currentdate.split("/")[0]
const month = currentdate.split("/")[1]
const day = currentdate.split("/")[2]
const Today = month + "/" + day + "/" + year

Game.on("playerJoin", async(player) => {

	//a whole lot of spaghetti code (a lot copied from internet) to get the day count. Everything other than the year is only used for the score.

	let UserInfo = await player.getUserInfo()
	let JoinDate = UserInfo.created_at
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
	console.log(Today)
	console.log(player.JoinDate)

	player.setScore(player.AccountAge)

	if (player.AccountAge==69) {
		console.log("n i c e")
		Game.messageAll(`[#ff0000][SERVER]: [#ffffff]${player.username}'s account age is N I C E`)
	} else console.log(player.AccountAge)

	for (let players of Game.players) {
		if (players.score==69 && players!==player) player.message(`[#ff0000][SERVER]: [#ffffff]${players.username}'s account age is N I C E`)
	}
	
	player.message("Check the description to find out what this game is")
	console.log(player.Date3)
	
	player.TestMembership=player.membershipType

	//puts me on owner team
	if (player.userId==305122 || player.userId==1) {
		player.setTeam(world.teams.find(team => team.name == "Owner"))
		player.TestMembership = 4
	} else {
		player.setTeam(world.teams.find(team => team.name == player.Date3))
	}
	
	player.Awards = UserInfo.awards
	
	//allowing me to go in the entire tower
	if (player.userId==305122) player.Date3=2016

	//PUT DEBUG CODE IN HERE
	if (Game.local) {
		console.log("Player has joined locally.")
	}

	//sending message for what part of the tower they can enter
	if (player.Date3==2020) {
		player.message("Since you joined in 2020, you don't have access to the tower.")
	} else if (player.Date3>2016) {
		player.message("You have access to the " + player.Date3 + " level of the tower!")
	} else player.message("You have access to the ENTIRE Tower!!!")

	for (i=player.Date3; i<2020; i++) {
		writeBoxPacket(player, i)
	} 

	//allow 2020 users (and me) to enter the house
	if (player.Date3==2020 || player.userId==305122 || Game.local) {
		writeBoxPacket(player, 2020)
		player.message("You have access to the house, which only 2020 users can enter!")
	}

	//checks if user is me or has a membership
	if (player.TestMembership>1) {
		console.log("Player has membership")
		for (i=2; i<=player.TestMembership; i++) {
			writeBoxPacket(player, `Member${i}`)
		}
	}
	// checks if user is a Brick Hill admin
	if (player.admin) {
		writeBoxPacket(player, "Admin")
		console.log("Player is a Brick Hill admin")
	}
	//checks if user is a brick saint.
	if (player.Awards.some(item => item.award_id == 5)) {
		writeBoxPacket(player, "Saint")
		console.log("Player is a Brick Saint")
	}
	
	let canTrade = player.NoTradeInfo

	//checks brick-hill.trade value and allows player in boxes accordingly
	if (player.NoTradeInfo==false) {
		console.log("Successfully retrieved brick-hill.trade data!")
		player.playerValue = await Math.floor(player.TradeInfo.value/1000)
		if (player.playerValue==0) player.message("You can't access the Green Tower as you don't have enough value.")
		if (player.playerValue>=1000) player.playerValue=1000
		for (i=1; i<=player.playerValue; i*=10) {
			writeBoxPacket(player, `${i}kValue`)
		}
	} else player.message("Couldn't retrieve brick-hill.trade data. Go to https://brick-hill.trade/user/" + player.userId + " and rejoin?")
})

async function writeBoxPacket(p, y) {

	//sends packet to player to make the brick not have collision

	for (let bricks of world.bricks) {
		if (bricks.name===`${y}Brick`) {
			await sleep(20)
			brickPacket = new PacketBuilder("Brick")
				.write("uint32", bricks.netId)
				.write("string", "collide")
				.write("bool", false)
			brickPacket.send(p.socket)
		}
	}

	//send a message to the player saying what part of the tower they can enter.

	if (y=="1kValue") {
		if (p.playerValue>=10) return
		console.log("user has 1k+ value")
		return p.message("You have access to the 1k Value level of the Green Tower!")
	}
	
	if (y=="10kValue") {
		if (p.playerValue>=100) return
		console.log("user has 10k+ value")
		return p.message("You have access to the 10k Value level of the Green Tower!")
	}

	if (y=="100kValue") {
		if (p.playerValue>=1000) return
		console.log("user has 100k+ value")
		return p.message("You have access to the 100k Value level of the Green Tower!")
	}
	
	if (y=="1000kValue") {
		console.log("user has 1mil+ value")
		return p.message ("You have access to the ENTIRE Green Tower!!!")
	}
	
	if (y=="Member2") {
		if (p.TestMembership!==2) return
		return p.message("You have access to the Mint level of the Small Tower!")
	}
	
	if (y=="Member3") {	
		if (p.TestMembership!==3) return
		return p.message("You have access to the Ace level of the Small Tower!")
	}

	if (y=="Member4") {
		if (p.TestMembership!==4) return
		return p.message("You have access to the ENTIRE Small Tower!!")
	}

	if (y=="Saint") {
		p.message("Since you have the Brick Saint award, you have access to the Golden Box!")
	}  

	if (y=="Admin") {
		p.message("Since you are a Brick Hill admin, you have access to the Pink Box!")
		return
	}

	return
}