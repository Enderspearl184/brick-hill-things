const invmodule = require('./inventorymodule.js')
const save = require('./save_load.js')

Game.command("inv", (p) => {
	p.message("Inventory:")
	for (let item of p.bag) {
		p.message(item.name + " x " + item.amount)
	}
	p.message("Inventory Space: " + p.stats.bagSize)
})

Game.command("additem", (p, args) => {
	if (p.userId==305122 || Game.local) {
		invmodule.addItem(p, args.split(" ")[0], args.split(" ")[1], true)
	}
})

Game.command("clearinv", (p, v) => {
	let victim=Game.players.find((player) => player.username.toLowerCase().startsWith(v.toLowerCase()))
	if (!victim) return
	victim.bag=[]
	save.save(p, [], "inventory")
})

Game.on("playerJoin", (p) => {
	let inventory = save.load(p, "inventory")
	if (inventory!==undefined && inventory!=="err") {
		p.bag=inventory
	} else p.bag=[]
	p.setInterval(function() {
		save.save(p, p.bag, "inventory")
	}, 10000)
})

Game.on("playerLeave", (p) => {
	save.save(p, p.bag, "inventory")
})