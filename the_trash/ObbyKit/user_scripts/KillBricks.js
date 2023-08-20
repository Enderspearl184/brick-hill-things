world.bricks.forEach((brick) => {
	if (brick.name.startsWith("kill")) {
		brick.touching((p) => {
			p.kill()
		})
	}
})