world.bricks.forEach((brick) => {
	if (brick.name.startsWith("kill")) {
		brick.touching((p) => {
			if (!p.invincible) p.kill()
		})
	}
})