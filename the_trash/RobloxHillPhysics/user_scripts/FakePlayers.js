const port=42482; //change this to the second port you have forwarded.


const http=getModule("http");
const color=require("./../node_modules/node-hill/dist/util/color/colorModule.js").default;
const hex=require("./../node_modules/node-hill/dist/util/color/formatHex.js");
//const pickSpawn=require("./../node_modules/node-hill/dist/scripts/world/pickSpawn.js")
var chatMessages=[];
var ghostPlayerEdits=[];

Game.on("playerJoin", (p) => {
	p.on("chatted", (m) => {
		chatMessages.push({netId: p.netId, chat: `[${p.username}]: ${m}`})
		console.log(chatMessages)
	})
})

http.createServer(function (req, res) {
	if (req.url!=="/POSTplayerValues") return notfound(res);
	if (req.method!=="POST") return postrequest(res);
        let body = '';
       	req.on('data', chunk => {
      	   	body += chunk.toString();
      	});
	req.on('end', () => {
		let robloxjson = JSON.parse(body);
		if (Array.isArray(robloxjson.players) && Array.isArray(robloxjson.chat)) {
			handleFakePlayers(robloxjson);
			
			res.writeHead(200, {'Content-Type': 'application/json'});
			var playerinfo={
			players: [],
				chat: chatMessages,
				ghostPlayerEdits: ghostPlayerEdits,
				bricks: getBricks(),
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
					team:undefined,
					health:{maxHealth: players.maxHealth, Health: players.health}
				};
				if (players.team) {
					playervar.team=players.team.netId
				}
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

function getBricks() {
	let brickData=[]
	let env=world.environment
	world.bricks.forEach((brick) => {
		if (brick.name!=="unanchored") {
			let brickobj={
				Color:brick.color,
				netId: brick.netId,
				rotation:brick.rotation,
				position:{x: brick.position.x+(brick.scale.x/2),y:brick.position.z+(brick.scale.z/2)+0.5,z:brick.position.y+(brick.scale.y/2)},
				scale:{x: brick.scale.x, y: brick.scale.z, z: brick.scale.y},
				Transparency: ((brick.visibility-0.5)*-1)+0.5,
				CanCollide: brick.collision
			}
			brickData.push(brickobj)
		}
	})
	brickData.push({
		Color:env.baseColor,
		scale:{x:env.baseSize,y:0.05,z:env.baseSize},
		netId:"Baseplate",
		rotation:0,
		position:{x:0,y:0.4975,z:0},
		Transparency:0,
		CanCollide:true
	})
	return brickData
}

//actually used to handle the fake brick but yeah
function handleFakePlayers(obj) {
	if (!obj.unanchored || !obj.unanchored.position || !obj.unanchored.rotation || !obj.unanchored.scale) return
	let fakebrick=world.bricks.find((b) => b.name=="unanchored")
	if (!fakebrick) {
		fakebrick = new Brick(new Vector3(obj.unanchored.position.x, obj.unanchored.position.y,obj.unanchored.position.z), new Vector3(obj.unanchored.scale.x,obj.unanchored.scale.y,obj.unanchored.scale.z))
		fakebrick.collision=false
		fakebrick.name="unanchored"
		Game.newBrick(fakebrick)
	}
	fakebrick.setPosition(new Vector3(obj.unanchored.position.x,obj.unanchored.position.y,obj.unanchored.position.z))
	fakebrick.setRotation(obj.unanchored.rotation)
}



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