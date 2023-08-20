let MintStaff = new Tool
MintStaff.model = 30544

Game.on("playerJoin", (p) => {
		p.on("avatarLoaded", () => {
			let outfit = new Outfit(p)
				.hat1(30545)
				.hat2(30542)
				.face(30546)
				.set()
			p.equipTool(MintStaff)
		})
		p.on("initialSpawn", () => {
			if (p.membershipType!==2) {
				p.setScale(new Vector3(0.5, 0.5, 0.5))
			}
		})
})