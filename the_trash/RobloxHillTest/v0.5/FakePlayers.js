var chatMessages=[]
Game.on("playerJoin", (p) => {
	p.on("chatted", (m) => {
		chatMessages.push({netId: p.netId, chat: `[${p.username}]: ${m}`})
		console.log(chatMessages)
	})
})

http.createServer(function (req, res) {
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
	} else if (req.url=="/POSTplayerValues") {
		if (req.method!=="POST") return postrequest(res)

        	let body = '';
        	req.on('data', chunk => {
          		body += chunk.toString();
        	});
        	req.on('end', () => {
			let robloxjson = JSON.parse(body)
			if (Array.isArray(robloxjson.players) && Array.isArray(robloxjson.chat)) {
				res.writeHead(200, {'Content-Type': 'application/json'});
				res.end(JSON.stringify({code: 200, status: "well it might have worked, the json SEEMED valid but if the server crashes it\'s your fault"}));
				handleFakePlayers(robloxjson)
			} else return badRequest(res)
       		});
	} else {
		res.writeHead(404);
		res.end("404 Error. This kinda sucks, but you have an invalid URL :(\nURLS in use here are /GETplayerValues and /POSTplayerValues but don't try visiting using them as you might break something.");
	}
}).listen(42481);

function badRequest(res) {
	res.writeHead(400);
	res.end('400 Error; Bad Request. Not JSON or some other error? I TOLD YOU not to try to do stuff like this.')
} 
function getrequest(res) {
	res.writeHead(400);
	res.end('400 Error; Bad Request. You should use a GET request for this.')
}

function postrequest(res) {
	res.writeHead(400);
	res.end('400 Error; Bad Request. Ya need to use a POST request here, but please dont you might break something.')
}

async function handleFakePlayers(obj) {
	obj.chat.forEach((msg) => {
		Game.messageAll(`[#ffde0a][ROBLOX] ${msg.username}\\c1:\\c0 ` + msg.message);
	})

	//remove gone players
	for (let p of Game.fakePlayers) {
		if (!obj.players.find((player) => player.netId==p.netId)) {
			Game.fakePlayers.splice(Game.fakePlayers.indexOf(p), 1);
			let removepacket = new PacketBuilder("RemovePlayer")
			.write("uint32", p.netId)
			removepacket.broadcast();
			p.destroyed=true
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
			Game.fakePlayers.push({
				admin:0,
				alive:1,
				assets:{face:0,hat1:0,hat2:0,hat3:0,tool:0},
				authenticated:true,
				colors:{head:p.colors.head,leftArm:p.colors.leftArm,leftLeg:p.colors.leftLeg,rightArm:p.colors.rightArm,rightLeg:p.colors.rightLeg,torso:p.colors.torso},
				destroyed:false,
				membershipType:2,
				netId:p.netId,
				position: new Vector3(p.position.x,p.position.y,p.position.z),
				rotation: new Vector3(0,0,p.rotation),
				scale: new Vector3(1,1,1),
				score:0,
				speech:"",
				userId:0,
				username:p.username
			})
		} else {
			setFakePlayerPosition(p.netId, p.position)
			await sleep(100)
			setFakePlayerRotation(p.netId, p.rotation)
			await sleep(100)
			setFakePlayerColors(p.netId, p.colors)
		}
	}
}

function sendFakePlayers(p) {
	let newpacket = new PacketBuilder("SendPlayers")
	.write("uint8", 1)
	.write("uint32", p.netId)
	.write("string", p.username)
	.write("uint32", 0)
	.write("uint8", 0)
	.write("uint8", 2)
}

function setFakePlayerPosition(netid, pos) {
	let fakeplayer = Game.fakePlayers.find((fake) => fake.netId==netid)
	fakeplayer.position.x=pos.x;fakeplayer.position.y=pos.y;fakeplayer.z=pos.z;
	let pospacket = new PacketBuilder("Figure")
		.write("uint32", netid)
		.write("string", "ABC")
		.write("float", pos.x)
		.write("float", pos.y)
		.write("float", pos.z-3.5)
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

Game.fakePlayers=[]