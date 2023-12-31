const port=42481 //change this to the second port you have forwarded.


const http=getModule("http")
const color=require("./../node_modules/node-hill/dist/util/color/colorModule.js").default
const hex=require("./../node_modules/node-hill/dist/util/color/formatHex.js")

var chatMessages=[]
var ghostPlayerEdits=[];
Game.on("playerJoin", (p) => {
	p.on("chatted", (m) => {
		chatMessages.push({netId: p.netId, chat: `[${p.username}]: ${m}`})
		console.log(chatMessages)
	})
})

http.createServer(function (req, res) {
	if (req.url!=="/POSTplayerValues") return notfound(res)
	if (req.method!=="POST") return postrequest(res)
        let body = '';
       	req.on('data', chunk => {
      	   	body += chunk.toString();
      	});
	req.on('end', () => {
		let robloxjson = JSON.parse(body)
		if (Array.isArray(robloxjson.players) && Array.isArray(robloxjson.chat)) {
			handleFakePlayers(robloxjson)
			
			res.writeHead(200, {'Content-Type': 'application/json'});
			var playerinfo={
			players: [],
			chat: chatMessages,
				ghostPlayerEdits: ghostPlayerEdits
			};
			chatMessages=[];
			ghostPlayerEdits=[];
			for (let players of Game.players) {
				let playervar={
					username: players.username,
					netId: players.netId,
					score: players.score,
					position: {x: players.position.x, y: players.position.z, z: players.position.y},
					rotation:players.rotation.z,
					colors: {
						head:players.colors.head,
						torso: players.colors.torso,
						leftLeg: players.colors.leftLeg,
						rightLeg: players.colors.rightLeg,
						leftArm: players.colors.leftArm,
						rightArm: players.colors.rightArm
					},
					health:{maxHealth: players.maxHealth, Health: players.health}
				};
				playerinfo.players.push(playervar);
			};
			res.end(JSON.stringify(playerinfo));
		} else {
			return badRequest(res)
		}
	})
}).listen(port);

function badRequest(res) {
	res.writeHead(400);
	res.end('400 Error; Bad Request. Not JSON or some other error? I TOLD YOU not to try to do stuff like this.')
} 

function notfound(res) {
	res.writeHead(404);
	res.end('404 Error. bruh dont try to break shit')
}

function postrequest(res) {
	res.writeHead(400);
	res.end('400 Error; Bad Request. Ya need to use a POST request here, but please dont you might break something.')
}

function handleFakePlayers(obj) {
	//remove gone players
	for (let p of Game.fakePlayers) {
		if (!obj.players.find((player) => player.netId==p.netId)) {
			removeFakePlayer(p)
		}
	}

	//add new players
	for (let p of obj.players) {
		let fakeplr=Game.fakePlayers.find((plr) => plr.netId==p.netId)
		if (!fakeplr) {
			let newpacket = new PacketBuilder("SendPlayers")
			.write("uint8", 1)
			//.write("uint32", p.netId)
			.write("uint32", p.netId)
			.write("string", p.username)
			.write("uint32", 0)
			.write("uint8", 0)
			.write("uint8", 2)
			newpacket.broadcast()
			let fakeplayer={
				admin:0,
				roblox:true,
				alive:true,
				assets:{face:0,hat1:0,hat2:0,hat3:0,tool:0},
				authenticated:true,
				colors:{head:"#000000",leftArm:"#000000",leftLeg:"#000000",rightArm:"#000000",rightLeg:"#000000",torso:"#000000"},
				destroyed:false,
				health:100,
				maxHealth:100,
				membershipType:2,
				netId:p.netId,
				userId:p.netId,
				position: new Vector3(0,0,0),
				rotation: new Vector3(0,0,p.rotation),
				scale: new Vector3(1,1,1),
				score:0,
				speech:"",
				socket:{
					write:function(){return}
				},
				respawn:function(msg) {
					let playerEdit=getPlayerEdit(this);
					playerEdit.edits.respawn=true;
					playerEdit.health=this.maxHealth
				},
				message:function(msg="",filtered=false) {
					let playerEdit=getPlayerEdit(this);
					if (!playerEdit.serverMessages) playerEdit.serverMessages=[];
					playerEdit.serverMessages.push({
						msg:msg,
						filtered:filtered
					});
				},
				setHealth:function(health){
					let playerEdit=getPlayerEdit(this);
					playerEdit.edits.health=health;
					if (health>this.maxHealth) {
						this.maxHealth=health
					}
				},
				kill:function(){
					if (this.alive==false)return
					let playerEdit=getPlayerEdit(this);
					playerEdit.edits.kill=true;
					console.log("killing ghost player")
				},
				kick:function(){
					let playerEdit=getPlayerEdit(this);
					playerEdit.edits.kick=true;
					removeFakePlayer(this)
				},
				setPosition:function(position){
					setFakePlayerPosition(this.netId,position)
					position.z+=3.5;
					let playerEdit=getPlayerEdit(this);
					playerEdit.edits.position={x:position.x,y:position.z,z:position.y};
					position.z-=3.5
				},
				setSpeech:function(msg=""){
					this.speech=msg
					let newpacket = new PacketBuilder("Figure")
					.write("uint32", this.netId)
					.write("string", "f")
					.write("string", hex.default(msg))
					newpacket.broadcast()
				},
				setScore:function(score){
					let playerEdit=getPlayerEdit(this);
					playerEdit.edits.score=score
					this.score=score
					let newpacket = new PacketBuilder("Figure")
					.write("uint32", this.netId)
					.write("string", "X")
					.write("uint32", score)
					newpacket.broadcast()
				},
				prompt:this.message,
				userId:0,
				username:p.username
			}
			Game.fakePlayers.push(fakeplayer)
			Game.allPlayers.push(fakeplayer)
		} else {
			if (!(p.alive===false)) {
				let fake=Game.fakePlayers.find((plr) => plr.netId==p.netId).alive=true
				if (p.position)
					setFakePlayerPosition(p.netId, p.position)
				if (p.rotation)
					setFakePlayerRotation(p.netId, p.rotation)
				if (p.colors)
					setFakePlayerColors(p.netId, p.colors)
				setFakePlayerHealth(p.netId, false)
			} else {
				Game.fakePlayers.find((plr) => plr.netId==p.netId).alive=false
				setFakePlayerHealth(p.netId, true)
			}
		}
	}
	//handle chat
	obj.chat.forEach((msg) => {
		Game.messageRealPlayers(`[#ffde0a][ROBLOX] ${msg.username}\\c1:\\c0 ` + msg.message);
		let fake = Game.fakePlayers.find((fake) => fake.username==msg.username)
		if (fake) {
			clearTimeout(fake.bubbleTimer);
			fake.setSpeech(msg.message);
			fake.bubbleTimer=setTimeout(() => {
				fake.setSpeech("")
			}, 6000)
		}
	})
}

function getPlayerEdit(p) {
	let playerEdit=ghostPlayerEdits.find((edit)=>edit.username==p.username);	
	if (!playerEdit) {
		playerEdit={username:p.username,edits:{}}
		ghostPlayerEdits.push(playerEdit)
	}
	return playerEdit
}

function removeFakePlayer(p) {
	Game.fakePlayers.splice(Game.fakePlayers.indexOf(p), 1);
	Game.allPlayers.splice(Game.allPlayers.indexOf(p), 1);
	let removepacket = new PacketBuilder("RemovePlayer")
	.write("uint32", p.netId)
	removepacket.broadcast();
	p.destroyed=true
}

function sendFakePlayers(p) {
	let newpacket = new PacketBuilder("SendPlayers")
	.write("uint8", 1)
	.write("uint32", p.netId)
	.write("string", p.username)
	.write("uint32", 0)
	.write("uint8", 0)
	.write("uint8", 2)
	newpacket.broadcast()
}

function setFakePlayerPosition(netid, pos) {
	let fakeplayer = Game.fakePlayers.find((fake) => fake.netId==netid)
	fakeplayer.position.x=pos.x;fakeplayer.position.y=pos.y;fakeplayer.z=pos.z;
	let pospacket = new PacketBuilder("Figure")
		.write("uint32", netid)
		.write("string", "ABC")
		.write("float", pos.x)
		.write("float", pos.y)
		.write("float", pos.z)
	pospacket.broadcast()
}

function setFakePlayerHealth(netid, dead) {
	let hppacket = new PacketBuilder("Kill")
		.write("float", netid)
		.write("bool", dead)
	hppacket.broadcast()
}

function setFakePlayerRotation(netid, rot) {
	if (rot<0) rot=rot+360
	let fakeplayer = Game.fakePlayers.find((fake) => fake.netId==netid)
	fakeplayer.rotation.z=rot
	let rotpacket = new PacketBuilder("Figure")
		.write("uint32", netid)
		.write("string", "F")
		.write("float", rot)
	rotpacket.broadcast()
}

function setFakePlayerColors(netid, colors) {
	let fakeplayer = Game.fakePlayers.find((fake) => fake.netId==netid)
	fakeplayer.colors=colors
	let colorpacket = new PacketBuilder("Figure")
		.write("uint32", netid)
		.write("string", "KLMNOPQUVW")
		.write("uint32", color.hexToDec(colors.head))
		.write("uint32", color.hexToDec(colors.torso))
		.write("uint32", color.hexToDec(colors.leftArm))
		.write("uint32", color.hexToDec(colors.rightArm))
		.write("uint32", color.hexToDec(colors.leftLeg))
		.write("uint32", color.hexToDec(colors.rightLeg))
		.write("uint32", 0)
		.write("uint32", 0)
		.write("uint32", 0)
		.write("uint32", 0)
	colorpacket.broadcast()
}

Game.fakePlayers=[]
Game.allPlayers=[]

Game.messageAll=function(message,filtered) { //filtered isnt being used rn ill add it later
	Game.allPlayers.forEach((p)=>{
		p.message(message,filtered)
	})
    
}

Game.messageRealPlayers=function(message) {
	Game.players.forEach((p)=>{
		p.message(message)
	})
    
}

Game.messageFakePlayers=function(message,filtered) {
	Game.fakePlayers.forEach((p)=>{
		p.message(message,filtered)
	})
    
}

Game.on("playerJoin", (p) => {
	Game.allPlayers.push(p)
	Game.messageFakePlayers(`\\c6[SERVER]: \\c0${p.username} has joined the server!`)
	p.on("initialSpawn", () => {
		let newpacket = new PacketBuilder("SendPlayers")
		.write("uint8", Game.fakePlayers.length)
		for (let fake of Game.fakePlayers) {
			newpacket.write("uint32", fake.netId)
			newpacket.write("string", fake.username)
			newpacket.write("uint32", 0)
			newpacket.write("uint8", 0)
			newpacket.write("uint8", 2)
		}
		newpacket.send(p.socket)
	})
})
Game.on("playerLeave", (p) => {
	Game.allPlayers.splice(Game.allPlayers.indexOf(p),1)
	Game.messageFakePlayers(`\\c6[SERVER]: \\c0${p.username} has left the server!`)
})

/*
  	if (req.url=="/GETplayerValues") {
		if (req.method!=='GET') return getrequest(res)
		res.writeHead(200, {'Content-Type': 'application/json'});
		var playerinfo={
			players: [],
			chat: chatMessages
		};
		chatMessages=[];
		for (let players of Game.players) {
			let playervar={
				username: players.username,
				netId: players.netId,
				position: {x: players.position.x, y: players.position.z, z: players.position.y},
				rotation:players.rotation.z,
				colors: {
					head:players.colors.head,
					torso: players.colors.torso,
					leftLeg: players.colors.leftLeg,
					rightLeg: players.colors.rightLeg,
					leftArm: players.colors.leftArm,
					rightArm: players.colors.rightArm
				},
				health:{maxHealth: players.maxHealth, Health: players.health}
			};
			playerinfo.players.push(playervar);
		};
		res.end(JSON.stringify(playerinfo));
*/