//this just defines the pickaxes so that the pickaxe.js script is less messy

const starterPick = new Tool("Starter Pickaxe")
starterPick.model=112068
starterPick.Unbreakable=true
starterPick.Durability="Unbreakable"
starterPick.Strength=1

const debugPick = new Tool("Debug Pickaxe")
debugPick.model=112068
debugPick.Strength=1000000
debugPick.Unbreakable=true
debugPick.Durability="Unbreakable"

const sturdyPick = new Tool("Sturdy Pickaxe")
sturdyPick.model=112068
sturdyPick.Unbreakable=false
sturdyPick.Durability=100
sturdyPick.Strength=5

const picks = {
	starterPick: starterPick,
	sturdyPick: sturdyPick,
	debugPick: debugPick
}

module.exports = picks