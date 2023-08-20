const http=Game.serverSettings.sandbox.http

var chatMessages=[]
var ghostPlayerEdits=[];
Game.on("playerJoin", (p) => {
	p.on("chatted", (m) => {
		chatMessages.push({netId: p.netId, chat: `[${p.username}]: ${m}`})
		console.log(chatMessages)
	})
})

http.createServer(function (req, res) {
	if (req.url=="/POSTplayerValues") {
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
	} else {
		res.writeHead(404);
		res.end("404 Error. This kinda sucks, but you have an invalid URL :(\nThe URL in use here is /POSTplayerValues but don't try doing stuff to it as you probably will break something.");
	}
}).listen(42481);

function badRequest(res) {
	res.writeHead(400);
	res.end('400 Error; Bad Request. Not JSON or some other error? I TOLD YOU not to try to do stuff like this.')
} 

function postrequest(res) {
	res.writeHead(400);
	res.end('400 Error; Bad Request. Ya need to use a POST request here, but please dont you might break something.')
}

async function handleFakePlayers(obj) {
	//remove gone players
	for (let p of Game.fakePlayers) {
		if (!obj.players.find((player) => player.netId==p.netId)) {
			removeFakePlayer(p)
		}
	}

	await sleep(100)

	//add new players
	for (let p of obj.players) {
		let fakeplr=Game.fakePlayers.find((plr) => plr.netId==p.netId)
		if (!fakeplr) {
			let newpacket = new PacketBuilder("SendPlayers")
			.write("uint8", 1)
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
				colors:{head:p.colors.head,leftArm:p.colors.leftArm,leftLeg:p.colors.leftLeg,rightArm:p.colors.rightArm,rightLeg:p.colors.rightLeg,torso:p.colors.torso},
				destroyed:false,
				health:100,
				maxHealth:100,
				membershipType:2,
				netId:p.netId,
				userId:p.netId,
				position: new Vector3(p.position.x,p.position.y,p.position.z),
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
				message:function(msg) {
					let playerEdit=getPlayerEdit(this);
					if (!playerEdit.serverMessages) playerEdit.serverMessages=[];
					playerEdit.serverMessages.push(msg);
				},
				setHealth:function(health){
					let playerEdit=getPlayerEdit(this);
					playerEdit.edits.health=health;
					if (health>this.maxHealth) {
						this.maxHealth=health
					}
				},
				kill:function(){
					let playerEdit=getPlayerEdit(this);
					playerEdit.edits.kill=true;
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
				},
				setSpeech:function(msg=""){
					this.speech=msg
					let newpacket = new PacketBuilder("Figure")
					.write("uint32", this.netId)
					.write("string", "f")
					.write("string", formatHex(msg))
					newpacket.broadcast()
				},
				setScore:function(score){
					let playerEdit=getPlayerEdit(this);
					playerEdit.edits.score=score
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
				setFakePlayerPosition(p.netId, p.position)
				await sleep(100)
				setFakePlayerRotation(p.netId, p.rotation)
				await sleep(100)
				setFakePlayerColors(p.netId, p.colors)
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

function setFakePlayerRotation(netid, rot) {
	if (rot<0) rot=rot+360
	let fakeplayer = Game.fakePlayers.find((fake) => fake.netId==netid)
	fakeplayer.rotation.z=rot
	let rotpacket = new PacketBuilder("Figure")
		.write("uint32", netid)
		.write("string", "F")
		.write("uint32", rot)
	rotpacket.broadcast()
}

function setFakePlayerColors(netid, colors) {
	let fakeplayer = Game.fakePlayers.find((fake) => fake.netId==netid)
	fakeplayer.colors=colors
	let colorpacket = new PacketBuilder("Figure")
		.write("uint32", netid)
		.write("string", "KLMNOPQUVW")
		.write("uint32", hexToDec(colors.head))
		.write("uint32", hexToDec(colors.torso))
		.write("uint32", hexToDec(colors.leftArm))
		.write("uint32", hexToDec(colors.rightArm))
		.write("uint32", hexToDec(colors.leftLeg))
		.write("uint32", hexToDec(colors.rightLeg))
		.write("uint32", 0)
		.write("uint32", 0)
		.write("uint32", 0)
		.write("uint32", 0)
	colorpacket.broadcast()
}

function hexToDec(hex) {
    hex = hex.replace(/^#/, "");
    const rgb = hexToRGB(hex);
    return rgbToDec(rgb[0], rgb[1], rgb[2]);
}
function hexToRGB(hex) {
    hex = hex.replace(/^#/, "");
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return [r, g, b];
}
function rgbToDec(r, g, b) {
    const rgb = r | (g << 8) | (b << 16);
    return rgb.toString(10);
}
function rgbToBgr(rgb) {
    return rgb.substring(4, 6) + rgb.substring(2, 4) + rgb.substring(0, 2);
}
const COLOR_REGEX = /(\[#[0-9a-fA-F]{6}\])/g;
function formatHex(input) {
    const match = input.match(COLOR_REGEX);
    if (!match)
        return input;
    match.forEach((colorCode) => {
        let hexCol = colorCode.replace(/[\[#\]]/g, "").toUpperCase();
        hexCol = rgbToBgr(hexCol);
        input = input.replace(colorCode, `<color:${hexCol}>`);
    });
    return input;
}

Game.fakePlayers=[]
Game.allPlayers=[]

Game.messageAll=function(message) {
	Game.allPlayers.forEach((p)=>{
		p.message(message)
	})
    
}

Game.messageRealPlayers=function(message) {
	Game.players.forEach((p)=>{
		p.message(message)
	})
    
}

Game.messageFakePlayers=function(message) {
	Game.fakePlayers.forEach((p)=>{
		p.message(message)
	})
    
}

Game.on("playerJoin", (p) => {
	Game.allPlayers.push(p)
	Game.messageFakePlayers(`\\c6[SERVER]: \\c0${p.username} has joined the server!`)
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