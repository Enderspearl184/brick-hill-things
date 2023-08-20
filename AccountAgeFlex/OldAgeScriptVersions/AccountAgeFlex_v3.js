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
	console.log(Today)
	console.log(player.JoinDate)
	let date1 = new Date(player.JoinDate);
	let date2 = new Date(Today);
	let diffTime = Math.abs(date2 - date1);
	player.AccountAge = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
	console.log(player.AccountAge)
	player.setScore(player.AccountAge)
	player.message("Check the description to find out what this game is")
	console.log(player.Date3)
	
	if (player.userId==305122) {
		player.setTeam(world.teams.find(team => team.name == "Owner"))
	} else {
		player.setTeam(world.teams.find(team => team.name == player.Date3))
	}
	
	player.Awards = UserInfo.awards
	
	//allowing me to go in the entire tower
	if (player.userId==305122) player.Date3=2016

	if (player.Date3==2020) player.message("Since you joined in 2020, you don't have access to the tower.")

	for (i=player.Date3; i<2020; i++) {
		writeBoxPacket(player, i)
	} 

	//checks if user is me or has a membership
	if (player.userId==305122 || player.membershipType>1) {
		writeBoxPacket(player, "Member")
		console.log("Player has a membership")
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
	
})

async function writeBoxPacket(p, y) {

	//sends packet to player to make the brick not have collision

	let bricks = world.bricks.find(brick => brick.name === `${y}Brick`)
	await sleep(20)
	brickPacket = new PacketBuilder("Brick")
	.write("uint32", bricks.netId)
	.write("string", "collide")
	.write("bool", false)
	brickPacket.send(p.socket)

	//send a message to the player saying what part of the tower they can enter.


	if (y=="Saint") {
		p.message("Since you have the Brick Saint award, you have access to the Golden Box!")
		return
	}  
	if (y=="Member") {
		p.message("Since you have a membership, you have access to the Pink Box!")
		return
	}  
	if (y=="Admin") {
		p.message("Since you are a Brick Hill admin, you have access to the Blue Box!")
		return
	}
	return p.message("You have access to the " + y + " level of the tower!")
}