const url="https://api.brick-hill.com/v1/shop/"
const fs=getModule("fs")
const phin=getModule("phin")


var userId=1003
var id=199947//item id to start at!!!!!!

const bruh=[
202,
23515
]

var isFinished=false

/*
var hats=require("./../DATA/1003_hat.json") //hat
var tools=require("./../DATA/1003_tool.json") //tool
var faces=require("./../DATA/1003_face.json") //face
var heads=require("./../DATA/1003_head.json") //head
var figures=require("./../DATA/1003_figure.json") //figure
var tshirts=require("./../DATA/1003_tshirt.json") //tshirt
var shirts=require("./../DATA/1003_shirt.json") //shirt
var pants=require("./../DATA/1003_pants.json") //pants
*/

var hats=[] //hat
var tools=[] //tool
var faces=[] //face
var heads=[] //head
var figures=[] //figure
var tshirts=[] //tshirt
var shirts=[] //shirt
var pants=[] //pants


Game.save=function(){
fs.writeFile(`./DATA/${userId}_hat.json`, JSON.stringify(hats, 5), function (err) {
	if (err) throw err;
});
fs.writeFile(`./DATA/${userId}_tool.json`, JSON.stringify(tools, 5), function (err) {
	if (err) throw err;
});
fs.writeFile(`./DATA/${userId}_face.json`, JSON.stringify(faces, 5), function (err) {
	if (err) throw err;
});
fs.writeFile(`./DATA/${userId}_head.json`, JSON.stringify(heads, 5), function (err) {
	if (err) throw err;
});
fs.writeFile(`./DATA/${userId}_figure.json`, JSON.stringify(figures, 5), function (err) {
	if (err) throw err;
});
fs.writeFile(`./DATA/${userId}_tshirt.json`, JSON.stringify(tshirts, 5), function (err) {
	if (err) throw err;
});
fs.writeFile(`./DATA/${userId}_shirt.json`, JSON.stringify(shirts, 5), function (err) {
	if (err) throw err;
});
fs.writeFile(`./DATA/${userId}_pants.json`, JSON.stringify(pants, 5), function (err) {
	if (err) throw err;
});
}

async function doThing() {
while (!isFinished) {
	let data = await phin(url + id)
	let JSONItemData = JSON.parse(data.body.toString())
	if (!JSONItemData.error && JSONItemData.data.creator.id==userId) {
		switch (JSONItemData.data.type.type) {
			case "pants":
				pants.push({id:JSONItemData.data.id, name:JSONItemData.data.name})
				break;
			case "shirt":
				shirts.push({id:JSONItemData.data.id, name:JSONItemData.data.name})
				break;
			case "tshirt":
				tshirts.push({id:JSONItemData.data.id, name:JSONItemData.data.name})
				break;
			case "figure":
				figures.push({id:JSONItemData.data.id, name:JSONItemData.data.name})
				break;
			case "head":
				heads.push({id:JSONItemData.data.id, name:JSONItemData.data.name})
				break;
			case "face":
				faces.push({id:JSONItemData.data.id, name:JSONItemData.data.name})
				break;
			case "hat":
				hats.push({id:JSONItemData.data.id, name:JSONItemData.data.name})
				break;
			case "tool":
				tools.push({id:JSONItemData.data.id, name:JSONItemData.data.name})
				break;
		}
		console.log("ID: " + id + ", (" + JSONItemData.data.type.type + ") " + JSONItemData.data.name)
		id++
	} else if (JSONItemData.error && JSONItemData.error.message=="Record not found" && !bruh.includes(id)) {
		isFinished=true
		console.log("IT DONE!!!" + id)
	} else {
		if (JSONItemData.error) console.log(JSONItemData.error.message + " id: " + id)
		id++
	}
}
Game.save()
}
doThing().catch = function(err) {
	console.warn(err)
	doThing()
}



