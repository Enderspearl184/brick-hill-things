const pickaxe = require('./pickaxeModule.js')
//const saves = require('./save_load.js')

const buyOptions = [
	{name: "Bag Upgrade", dataName:"BagUpgrade", cost:300, type:"special", special:"increaseBag"},
	{name: "Sturdy Pickaxe", dataName:"sturdyPick", cost:250, type:"pickaxe"},
	{name: "DEBUG PICKAXE", dataName:"debugPick", cost:69420, type:"pickaxe"}
]

function increaseBag (p) {
	if (p.stats.bagSize<=6000) {
		p.stats.bagSize+=200
	} else {
		var bagUpgrade = buyOptions.find((bag) => bag.dataName=="BagUpgrade")
		p.stats.Money+=bagUpgrade.cost
		p.setScore(p.stats.Money)
		return p.message("Your bag is too large to upgrade! Here's your money back I guess...")
	}
}

Game.command("shop", (p, a) => {
	var args = a.split(" ")
	if (args[0]!=="list") {
		p.message("Use /sell itemname amount/all to sell items and use /buy itemname to buy items")
		p.message("Use /shop list (page) to get a shop list.")
		p.message("Use /buy (item) to buy an item from the shop.")
	} else {
		let page = args[1]
		if (!args[1] || isNaN(page) || page.length>=10 || page<=0) page=1
		p.message("-- Shop Page " + page + "/" + Math.ceil(buyOptions.length/5) + " --")
		for (i=0+(5*(page-1)); i<=5*page;i++) {
			if (buyOptions[i]) p.message(buyOptions[i].name + " - Cost: " + buyOptions[i].cost)
		}
		p.message("--------------------")
	}
})

Game.command("buy", (p, a) => {
	let wanted = buyOptions.find((item) => item.name.toLowerCase()==a.toLowerCase())
	if (wanted.cost<=p.stats.Money) {
		if (wanted.type==="special") {
			eval(wanted.special + "\(p\)")
		} else if (wanted.type==="pickaxe") {
			if (wanted.dataName=="debugPick") return p.message("lol no")
			if (p.pickaxes.Pickaxes[wanted.dataName]) return p.message("You already have this pickaxe!")
			pickaxe.addPick(p,wanted.dataName)
		}
		p.stats.Money-=wanted.cost
		p.setScore(p.stats.Money)
		p.message("Successfully bought item.")
	} else return p.message("This item costs too much!")
})