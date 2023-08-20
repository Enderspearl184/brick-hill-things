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
	let UserInfo = await player.getUserInfo()
	let JoinDate = UserInfo.created_at
	let DateOnly = JoinDate.split(" ")[0]
	let Date1 = DateOnly.split("-")[1]
	let Date2 = DateOnly.split("-")[2]
	let Date3 = DateOnly.split("-")[0]
	let TrueDate = Date1 + "-" + Date2 + "-" + Date3
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

	if (player.userId==305122 || player.admin==true || player.membershipType>1 || player.AccountAge >= 365) {
		return
	} else {
		let housebrick = new Brick(new Vector3(9, -30, 4), new Vector3(49, 52, 18))
		housebrick.visibility = 0
		player.newBrick(housebrick)
	}
})