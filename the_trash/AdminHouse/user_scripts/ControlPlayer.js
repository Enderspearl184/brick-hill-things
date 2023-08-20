Game.command("control", (caller, args) => {
	//if (caller.userId !== 305122 && caller.userId !== 1) return
	const player = getPlayer(args)
	if (!player) return uncontrol(caller)
	if (player.username!==caller.username) {
		return control(caller, player)
	}
})

async function control(p, v) {
	
	if (p.username == v.username) return p.message("You can't control yourself!")

	if (p.controlling!==undefined) uncontrol(p)

	if (p.controlledby!==undefined) uncontrol(p)

	if (v.controlledby!==undefined) {
		return p.message("That player is being controlled right now.")
	}

	if (v.controlling!==undefined) {
		return p.message("That player is controlling someone right now.")
	}

	v.controlledby=p
	p.controlling=v
	v.setSpeed(0)
	v.setJumpPower(0)
	p.setPosition(v.position)
	p.setAvatar(v.userId)
	v.setCameraObject(p)
	
	console.log(p.username + " is now controlling " + v.username)
	v.message("You are now being controlled by " + p.username)

	while (v.controlledby==p && p.controlling==v) {
		await sleep(10)
		if (v.position !== p.position || v.rotation !== v.lastRotation) {
			v.setPosition(p.position)
			v.lastRotation = v.rotation
			setRotation(p.rotation, v)
		}
	}
	
}

function uncontrol(p) {
	if (p.controlling!==undefined) {
		let v = p.controlling
		v.controlledby=undefined
		p.controlling=undefined
		v.setSpeed(4)
		v.setJumpPower(5)
		p.setAvatar(p.userId)
		v.setAvatar(v.userId)
		v.setCameraObject(v)
		v.message("You are no longer being controlled.")
		return p.message("You have stopped controlling " + v.username)
	}
	if (p.controlledby!==undefined) {
		let v = p.controlledby
		v.setAvatar(v.userId)
		v.controlling=undefined
		p.controlledby=undefined
		p.setSpeed(4)
		p.setJumpPower(5)
		p.setAvatar(p.userId)
		p.setCameraObject(p)
		v.message("You are no longer controlling " + p.username)
		return p.message("You are no longer being controlled.")
	}
	return p.message("But nothing happened...")
}

function setRotation(rot, v) {
	let rotpacket = new PacketBuilder("Figure")
		.write("uint32", v.netId)
		.write("string", "F")
		.write("uint32", rot.z)
	rotpacket.broadcast()
}

function getPlayer(name) {
    // copied from cheat's admin v2 because it just WORKS
    for (let player of Game.players) {
        if (player.username.toLowerCase().indexOf(String(name).toLowerCase()) == 0) {
            const victim = Array.from(Game.players).find(p => p.username === player.username)
            return victim
        }
    }
}