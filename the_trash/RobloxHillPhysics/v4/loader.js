Game.rbxport=42481; //change this to the second port you forwarded

let phin = getModule("phin")

const fakeplayerurl="https://raw.githubusercontent.com/Enderspearl184/roblox-brick-hill/main/source/FakePlayers.js"
const hitdetectionurl="https://raw.githubusercontent.com/Enderspearl184/roblox-brick-hill/main/source/brickHitDetection.js"

function load() {
	loadurl(fakeplayerurl)
	loadurl(hitdetectionurl)
	console.log("loaded scripts!")
}

async function loadurl(url) {
	let data = await phin({url: url})
	let body = data.body.toString()
	eval(body)
}
try {
	load()
}
catch(err) {
	console.log("A script errored!")
	console.error(err.stack)
}