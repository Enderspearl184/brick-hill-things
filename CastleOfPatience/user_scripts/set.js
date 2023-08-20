//2 hours is 7200000 milliseconds
//Date.now() returns milliseconds

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const phin = getModule("phin")
    .defaults({ parse: "json", timeout: 12000 });
const API = (assetId, cursor) => `https://api.brick-hill.com/v1/shop/${assetId}/owners?limit=100&cursor=${cursor}`;


//let lastunix=1628578860388 //unix time for 12:00 PST because node.js is REALLY WEIRD
let lastunix=1628578800000
var owners=0
var tenBrickOwners=1
var fiftyBrickOwners=1
var hundredBrickOwners=1
var twoFiftyBrickOwners=1
var fiveHundredBrickOwners=1
let brickArray=world.bricks
world.bricks=[]

Game.sendBricks=false

Game.on("playerJoin", async(p)=>{
	if (world.bricks.length) {
		p.loadBricks(world.bricks)
	}
	if (await p.ownsAsset(268957)) p.setScore(p.score+1)
	if (await p.ownsAsset(269522)) p.setScore(p.score+10)
	if (await p.ownsAsset(269523)) p.setScore(p.score+50)
	if (await p.ownsAsset(269524)) p.setScore(p.score+100)
	if (await p.ownsAsset(269527)) p.setScore(p.score+250)
	if (await p.ownsAsset(269528)) p.setScore(p.score+500)
})

async function addBrick() {
	if (brickArray.length) {
		let randbrick=brickArray[Math.floor(Math.random() * brickArray.length)];
		//let randbrick=brickArray[0]
		brickArray.splice(brickArray.indexOf(randbrick), 1)
		world.bricks.push(randbrick)
		Game.players.forEach((p)=>{p.newBrick(randbrick)})
		return true
	}
	return false
}

function getOwners(assetId) {
    return __awaiter(this, void 0, void 0, function* () {
        let cursor = '';
	let count=0
        while (cursor !== null) {
            const body = (yield phin({ url: API(assetId, cursor) })).body;
            for (let copy of body.data) {
                count++
            }
            cursor = body.next_cursor;
        }
        return count;
    });
}

function doAddBricks(mathunix) {
	for (i=1;i<=mathunix;i++) {
		if (brickArray.length) {
			addBrick()
			console.log("spawned brick " +world.bricks.length)
			lastunix+=7200000
		} else return lastunix+=7200000
	}
}

function init() {
	setInterval(async()=>{
		try {
			//1 brick owners
			let count = await getOwners(268957)
			if (count>owners) {
				for (i=1;i<=count-owners;i++) {
					addBrick()
				}
				owners=count
			}
			//10 brick owners
			let count2 = await getOwners(269522)
			if (count2>tenBrickOwners) {
				for (i=1;i<=(count2*10)-(tenBrickOwners*10);i++) {
					addBrick()
				}
				tenBrickOwners=count2
			}
			//50 brick owners
			let count3 = await getOwners(269523)
			if (count3>fiftyBrickOwners) {
				for (i=1;i<=(count3*50)-(fiftyBrickOwners*50);i++) {
					addBrick()
				}
				fiftyBrickOwners=count3
			}
			//100 brick owners
			let count4 = await getOwners(269524)
			if (count4>hundredBrickOwners) {
				for (i=1;i<=(count4*100)-(hundredBrickOwners*100);i++) {
					addBrick()
				}
				hundredBrickOwners=count4
			}
			//250 brick owners
			let count5 = await getOwners(269527)
			if (count5>hundredBrickOwners) {
				for (i=1;i<=(count5*250)-(hundredBrickOwners*250);i++) {
					addBrick()
				}
				twoFiftyBrickOwners=count5
			}
			//500 brick owners
			let count6 = await getOwners(269528)
			if (count6>fiveHundredBrickOwners) {
				for (i=1;i<=(count6*500)-(fiveHundredBrickOwners*500);i++) {
					addBrick()
				}
				fiveHundredBrickOwners=count6
			}
		} catch (err) {
			console.warn(err)
		}
	},15000)
	setInterval(async()=>{
			if (lastunix+7200000<=Date.now()) {
				let mathunix=Math.floor((Date.now()-lastunix)/7200000)
				if (mathunix>4824) {
					mathunix=4824
				}
				console.log(mathunix)
				doAddBricks(mathunix)
			}
			Game.bottomPrintAll(Math.floor(((lastunix+7200000)-Date.now())/1000) + " seconds until next brick.",1000)
			Game.topPrintAll(world.bricks.length + "/" + (world.bricks.length+brickArray.length) + " bricks placed.",1000)
	},1000)
}

init()