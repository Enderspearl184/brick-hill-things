var inventorymodule={
	addItem: function(p, name, amount, force) {
		if (!p || !p.bag) return
		let itemCount=0
		for (let i of p.bag) {
			itemCount+=i.amount
		}
		if (itemCount+amount>p.stats.bagSize && !force) {
			return p.message("Your Inventory is full, you can't carry this!")
		} else {
			var item = p.bag.find((inv) => inv.name==name)
			if (item!==undefined) {
				item.amount+=amount
			} else {
				p.bag.push({
					"name": name,
					"amount": amount
				})
			}
		}
	},
	removeItem: function(p, name, amount) {
		let item = p.bag.find((inv) => inv.name==name)
		if (item) {
			if (item.amount<=amount) {
				p.bag.splice(p.bag.indexOf(item), 1)
			} else {
				item.amount-=amount
			}
		}
	}
}

module.exports = inventorymodule