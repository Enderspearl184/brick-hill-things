//test.js is just used for small bits of code im testing to see how they work

setInterval(function() {
let brick=world.bricks.find((b)=>b.name=="kill")
if (brick && !brick.touchcheck) {
	brick.touchcheck=true
	brick.touching((p)=>{
		p.kill()
	})
}


let brick2=world.bricks.find((b)=>b.name=="points")
if (brick2 && !brick2.touchcheck) {
	brick2.touchcheck=true
	brick2.touching((p)=>{
		p.setScore(p.score+1)
	})
}

let brick3=world.bricks.find((b)=>b.name=="minuspoints")
if (brick3 && !brick3.touchcheck) {
	brick3.touchcheck=true
	brick3.touching((p)=>{
		if (p.score==0) return
		p.setScore(p.score-1)
	})
}

let brick4=world.bricks.find((b)=>b.name=="teamRed")
if (brick4 && !brick4.touchcheck) {
	brick4.touchcheck=true
	brick4.touching((p)=>{
		let t=Game.world.teams.find((t) =>t.name=="Team red")
		p.setTeam(t)
	})
}

let brick5=world.bricks.find((b)=>b.name=="teamBlue")
if (brick5 && !brick5.touchcheck) {
	brick5.touchcheck=true
	brick5.touching((p)=>{
		let t=Game.world.teams.find((t) =>t.name=="Team blue")
		p.setTeam(t)
	})
}
},1000)