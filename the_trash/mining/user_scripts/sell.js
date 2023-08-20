const invmodule = require('./inventorymodule.js')
const sellItems = {
	stone:1,
	coal:5,
	iron:7,
	sapphire:25,
	gold:20,
	ruby:50,
	diamond:75,
	uranium:69420
}


Game.command("sell", (p, args) => {
	if (args=="sell") return
	console.log(args)
	let arguments = args.split(" ")
	let item=arguments[0]
	let amount=arguments[1]
	if (item && amount) {
		if (amount=="all") {
			let bagitem = p.bag.find((i) => i.name.toLowerCase()==item.toLowerCase())
			if (bagitem) {
				if (sellItems[bagitem.name.toLowerCase()]) {
					invmodule.removeItem(p, bagitem.name, bagitem.amount)
					if (!p.stats.Money) p.stats.Money=0
					p.stats.Money+=(bagitem.amount*sellItems[bagitem.name.toLowerCase()])
					p.setScore(p.stats.Money)
					return p.message("I'll give you " + (bagitem.amount*sellItems[bagitem.name.toLowerCase()]) + " for those.")
				} else return p.message("You can't sell this!")
			} else return p.message("It doesn't seem you have this item.")
		} else {
			let bagitem = p.bag.find((i) => i.name.toLowerCase()==item.toLowerCase())
			if (bagitem) {
				if (sellItems[bagitem.name.toLowerCase()]) {
					if (bagitem.amount>=amount) {
						invmodule.removeItem(p, bagitem.name, amount)
						if (!p.stats.Money) p.stats.Money=0
						p.stats.Money+=(amount*sellItems[bagitem.name.toLowerCase()])
						p.setScore(p.stats.Money)
						return p.message("I'll give you " + (amount*sellItems[bagitem.name.toLowerCase()]) + " for those.")
					} else return p.message("You don't have enough of this item")
				} else return p.message("You can't sell this!")
			} else return p.message("It doesn't seem you have this item.")
		}
	} else return p.message("Use /sell (itemname) (amount/all) to sell items")
})