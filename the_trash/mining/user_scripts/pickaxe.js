//this script serves as a module AND a script.

//require the module functions
const functions=require('./pickaxeModule.js')
//pickaxes save ok
const save=require('./save_load.js')

//define the pickaxes - may not be needed lol
const pickaxes = require('./pickaxeArray.js')

const translate = {
	"starterpickaxe":"starterPick",
	"starter pickaxe":"starterPick",
	"starter":"starterPick",
	"sturdypickaxe":"sturdyPick",
	"sturdy pickaxe":"sturdyPick",
	"sturdy":"sturdyPick",
	"debugpickaxe":"debugPick",
	"debug pickaxe":"debugPick",
	"debug":"debugPick"
}

const untranslate = {
	"starterPick": "Starter Pickaxe",
	"sturdyPick": "Sturdy Pickaxe",
	"debugPick": "Debug Pickaxe"
}

Game.command("addpick", (p, a) => {
	if (!p.userId==305122 && !Game.local) return p.message("You can't use this!")
	let args = a.split(" ")
	let v=args[0]
	let type=translate[args[1].toLowerCase()]
	let victim=Game.players.find((player) => player.username.toLowerCase().startsWith(v.toLowerCase()))
	functions.addPick(victim,type)
})

Game.command("pickaxe", (p, a) => {
	let args=a.split(" ")
	let cmdtype = args[0]
	let cmdarg = args[1]
	if (cmdtype=="equip") {
		if (p.position.z<=-5) {
			p.message("You have to be at the surface to equip a different pickaxe!")
			return p.message("Use /reset to return to the surface.")
		}
		if (functions.equipPick(p, translate[cmdarg.toLowerCase()])) {
			return p.message("Successfully swapped pickaxe!")
		} else return p.message("You don't have this pickaxe")
	} else if (cmdtype=="list") {
		var ownedPicks = Object.keys(p.pickaxes.Pickaxes)
		p.message("Pickaxes Owned: ")
		for (let pick of ownedPicks) {
			p.message(untranslate[pick] + " - Durability: " + p.pickaxes.Pickaxes[pick].Durability)
		}
	} else {
		p.message("Usage:")
		p.message("/pickaxe equip (pickaxe)")
		p.message("/pickaxe list")
	}
})

function join(p) {
	for (let t of p.inventory) {
		p.destroyTool(t)
	}
	let picks = save.load(p, "pickaxes")
	if (picks==="err" || picks===undefined) {
		p.equipTool(pickaxes.starterPick)
		p.pickaxes={
			equippedPick:{
				type:"starterPick",
				Unbreakable:true,
				Durability:2147000000,
				Strength:3
			},
			Pickaxes:{
				starterPick:{
					Unbreakable:true,
					Durability:2147000000,
					Strength:3
				}
			}
		}
		save.save(p, p.pickaxes, "pickaxes")
	} else {
		p.pickaxes=picks
		if (p.pickaxes.equippedPick.type) {
			p.equipTool(pickaxes[p.pickaxes.equippedPick.type])
		}
	}
	p.setInterval(function() {
		save.save(p, p.pickaxes, "pickaxes")
	}, 60000)
}

Game.on("playerJoin", async(p) => {
	p.on("initialSpawn", async() => {
		join(p)
	})
})

Game.on("playerLeave", (p) => {
	save.save(p, p.pickaxes, "pickaxes")
})