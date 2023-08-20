Game.command("tutorial", (p,type) => {
	if (type=="obby") {
		p.setPosition(new Vector3(172, -59, 20.5))
		p.inTutorial=true
		p.setScore(0)
		obbytutorialStart(p)
		return
	}
	if (type=="lives") {
		p.message("In this game, there are lives.")
		p.message("If you run out of lives you get sent back to the start.")
		return
	}
	listTutorials(p)
})

function listTutorials(p) {
	p.message("Tutorials currently available:")
	p.message("/tutorial obby - gives a tutorial of what an obby is.")
	p.message("/tutorial lives - how do lives work?")
	//p.message("/tutorial modes - what do the special modes do?")
	//p.message("/tutorial secrets - ???????")
}

async function obbytutorialStart(p) {
	p.bottomPrint("You can exit the tutorial at any time with /reset",1000000)
	p.centerPrint("In an obby, there are bricks that kill you.", 2)
	await sleep(2000)
	p.centerPrint("Try to get across without touching them", 2)
}
world.bricks.find((b) => b.name=="obbyTutorialTrigger1").touchingEnded(async(p) => {
	p.centerPrint("Well done! There are also pits you can fall in.",2000)
	await sleep(2000)
	p.centerPrint("If you fall in, you also die. Try to get to the other side!",2)
})
world.bricks.find((b) => b.name=="obbyTutorialFinish").touching(async(p) => {
	p.message("Well done! You completed the obby tutorial!")
	p.setScore(p.checkpoint)
	p.inTutorial=false
	p.respawn()
})