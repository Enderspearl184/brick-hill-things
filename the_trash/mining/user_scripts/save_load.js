let fs=getModule("fs")
const savemodule = {
	save: function(p, data, type) {
		fs.writeFile(`./playerData/${p.userId}_${type}.json`, JSON.stringify(data), function (err) {
			if (err) throw err;
		});
	},
	load: function(p,type) {
		try {
		if (fs.existsSync(`./playerData/${p.userId}_${type}.json`)) {
			var response = fs.readFileSync(`./playerData/${p.userId}_${type}.json`, {encoding:"utf8"});
			return JSON.parse(response)
		} else return undefined
		} catch (err) {
			console.warn(err)
		}
	}
	
}

module.exports = savemodule