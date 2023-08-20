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
	//dont even ask just dont fucking change it ok?
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
	console.log(player.AccountAge);
	console.log(player.membershipType)
	player.setScore(player.AccountAge)
	player.message("Check the description to find out what this game is")
	console.log(player.Date3)

	//checks if user is me or has a membership or is a Brick Hill admin
	if (player.userId==305122 || player.membershipType>1 || player.admin) {
		console.log("Player has a membership")
	} else {
		let member = new Brick(new Vector3(2, 31, 0), new Vector3(19, 19, 18))
		member.visibility=0
		player.newBrick(member)
	}

	// checks if user is a Brick Hill admin
	if (player.admin) {
		console.log("user is an admin")
	} else {
		let admin = new Brick(new Vector3(2, 50, 0), new Vector3(19, 19, 18))
		admin.visibility=0
		player.newBrick(admin)
	}
	
	//checks if user is me or is a 2016 player
	if (player.userId==305122 || player.Date3==2016) {
		console.log("User is a 2016 player")
	} else {
		let topbrick = new Brick(new Vector3(2, -11, 53), new Vector3(43, 41, 18))
		topbrick.visibility=0
		player.newBrick(topbrick)
		//checks if user is me or is a 2017 player
		if (player.userId==305122 || player.Date3==2017) {
			console.log("User is a 2017 player")
		} else {
			//checks if user is me or a 2018 player
			if (player.userId==305122 || player.Date3==2018) {
				console.log("User is a 2018 player")
			} else {
				if (player.userId==305122 || player.Date3==2019) {
					console.log("User is a 2019 player")
				} else {
					console.log("User is a 2020 player")
				}
			}
		}
	}
})

const peasantbrick = new Brick(new Vector3(6, 51, 0), new Vector3(12, 15, 17))
peasantbrick.visibility=0
peasantbrick.collide=false
Game.newBrick(peasantbrick)
peasantbrick.touching((player) => {
	player.setSpeech("peasants")
})

function unBlockBox() {
}

function writeBoxPacket() {
}