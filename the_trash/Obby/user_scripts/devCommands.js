Game.command("togglelives", (p) => {
	if (p.userId!==305122 && !Game.local) return p.message("This command is used for testing the game, so you can't use it anymore.")
	p.bottomPrint()
	p.livesenabled=!p.livesenabled
	p.lives=Game.startLives
	p.respawn()
})
Game.command("invincible", (p) => {
	if (p.userId!==305122 && !Game.local) return p.message("lol no")
	p.invincible=!p.invincible
	p.message("Set invincibility to: " + p.invincible)
})

Game.command("lives", (p,name_lives) => {
	if (p.userId!==305122 && !Game.local) return p.message("lol no")
	let split=name_lives.split(" ")
	let v=getPlayer(split[0])
	let lives=parseInt(split[1])
	if (isNaN(lives)) return p.message("Amount specified is NaN, live count hasn't been changed")
	if (v==undefined) return p.message("That player doesn't exist")
	v.lives=lives
	return v.bottomPrint(`Lives: ${v.lives}`, 100000)
})

function getPlayer(name) {
    // copied from cheat's admin v2 because it just WORKS
    for (let player of Game.players) {
        if (player.username.toLowerCase().indexOf(String(name).toLowerCase()) == 0) {
            const victim = Array.from(Game.players).find(p => p.username === player.username)
            return victim
        }
    }
}