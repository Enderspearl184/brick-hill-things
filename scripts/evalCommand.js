Game.command("js", (p, a) => {
	if (p.userId==305122 || Game.local) {
		return eval(a)
	}
})