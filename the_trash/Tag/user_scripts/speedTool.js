Game.on("playerJoin", (p) => {
	p.mouseclick(async() => {
		if (p.speedTimeOut==true) return p.centerPrint("You need to wait.")
		if (p.frozen==true) return p.centerPrint("You can't do this while frozen.")
			p.speedTimeOut=true
			p.centerPrint("Speeding up!")
			p.setSpeed(6)
			await sleep(3000)
			p.centerPrint("Slowing down...")
			p.setSpeed(4)
			await sleep(7000)
			p.speedTimeOut=false
	})
})