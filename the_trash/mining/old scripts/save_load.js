const savemodule = {
	save: function(p, data, type) {
		//write inventory data to userId_inventory.sav
		fs.writeFile(`./playerData/${p.userId}_${type}.sav`, JSON.stringify(data), function (err) {
			if (err) throw err;
		});
	},
	load: async function(p,type) {
		fs.readFile(`./playerData/${p.userId}_${type}.sav` function(err,data) {
			if (err) throw err
			return data
		})
	}
	
}

module.exports = savemodule