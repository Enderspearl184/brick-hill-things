const pickaxes = require('./pickaxeArray.js')

const functions = {
	addPick: function(victim,type) {
		if (!victim.pickaxes.Pickaxes[type]) {
			victim.pickaxes.Pickaxes[type] = {
				Unbreakable:pickaxes[type].Unbreakable,
				Durability:pickaxes[type].Durability,
				Strength:pickaxes[type].Strength
			}
		}
	},

	equipPick: function(p, type) {
		if (p.pickaxes.Pickaxes[type]) {
			if (p.inventory) {
				for (let t of p.inventory) {
					p.destroyTool(t)
				}
			}
			p.pickaxes.equippedPick.type=type
			p.pickaxes.equippedPick.Strength = p.pickaxes.Pickaxes[type].Strength
			p.pickaxes.equippedPick.Durability = p.pickaxes.Pickaxes[type].Durability
			if (p.pickaxes.Pickaxes[type].Unbreakable || p.pickaxes.Pickaxes[type].Unbreakable==false) p.pickaxes.equippedPick.Unbreakable = p.pickaxes.Pickaxes[type].Unbreakable
			p.equipTool(pickaxes[type])
			return true
		} else return false
	}
}

module.exports = functions