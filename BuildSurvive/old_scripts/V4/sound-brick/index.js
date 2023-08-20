// Server side interface
// look in .sound-brick-loader.js for settings and setup

let curCall = init
function call(data, player) {
	curCall(data, player)
}
function init({ config, express, app, http, io }) {
	if (typeof config.InterfacePort === "undefined") console.error("*** sound-brick cannot start without a port!")
	let port = config.InterfacePort //The port the server runs on.

	io = io(http, {
		path: config.InterfaceIoPath,
	})

	app.get('/', function (req, res) {
		res.sendFile(__dirname + '/index.html')
	})

	app.use('/sounds', express.static(__dirname + "/sounds", { maxAge: 1800 })) // Cache: 30 min
	app.use('/musquito', express.static(__dirname + "/musquito", { maxAge: 259200 })) // Cache: 3 days

	http.listen(port, function () {
		console.log('sound-brick is listening on *: ' + port.toString())
	})

	let users = 0
	let sockets = []

	io.on('connection', function (socket) {
		users += 1
		sockets.push(socket)
		socket.socketarrayindex = sockets.length - 1

		socket.hasRequested = false
		socket.isWaiting = false
		socket.isLinked = false
		socket.playerobject = 0
		console.log('sound-brick user connected. ' + users.toString() + " users connected.")
		socket.on('disconnect', function () {
			if (socket.isWaiting == true) {
				socket.playerobject.isSocketWaiting = false
			}
			if (socket.isLinked == true) {
				socket.playerobject.message(`\\c7[SOUND-BRICK]: \\c6Uh oh. Your sound-brick session has disconnected!`)
				socket.playerobject.isLinked = false
			}
			users -= 1
			sockets.splice(sockets.indexOf(socket), 1)
			console.log('sound-brick user disconnected. ' + users.toString() + " users connected.")
		})

		socket.on('link', function (chatmessage) { //Send invite to player
			if (socket.hasRequested == false) {
				let player = getPlayer(chatmessage)
				if (player) {
					if (player.isLinked == false) {
						socket.hasRequested = true
						player.isSocketWaiting = true
						player.waitingSocket = socket
						player.message(`\\c7[SOUND-BRICK]: \\c0Did you request a link? Type in \\c5/accept \\c0to accept the sound link`)
					}
				}
			}
		})
	})

	const Example = {
		url: "www.example.com/wave.mp3", // [Required]
		position: new Vector3(), // [Optional] 3D sound position (Used with minDistance and maxDistance for rolloff)
		isGlobal: true, // [Required] If enabled then position, minDistance, minDecay and maxDistance will be ignored
		//sfxr: false, // [Optional and experimental] If enabled then url will be used as a jsfxr string. Please note that volume distancing won't work fully and isloop is not recommended.
		minDistance: 50, // [Optional] Distance before sound completely becomes unhearable (default 50)
		maxDistance: 10, // [Optional] Distance for full volume (default 10)
		isloop: false, // [Optional] [NOTE: If enabled then isGlobal will be set to true] If enabled then current playing loop will start over if url isnt the same
		musiccredit: "Music name | Mr Author | Licensed under Creative Commons: By Attribution 4.0 License", // [Optional] [Recommended for music loops] Credit!
	}

	function playSound(soundData, player) {
		const initErr = initSoundData(soundData)
		if (typeof initErr === "string") return console.log(initErr)

		// Play
		if (player) {
			if (player.isLinked == true) {
				if (soundData.position !== undefined) { // Distanced sound - To player
					const distance = Game.pointDistance3D(player.position, soundData.position)

					let clientData = createClientData(soundData)

					let volume = distanceVolume(soundData, distance)

					if (!volume) return

					clientData.volume = volume

					player.soundSocket.emit(`playSound`, clientData) // Send sound to a player
				} else { // Global - To player
					let clientData = createClientData(soundData)
					clientData.volume = 1
					return player.soundSocket.emit(`playSound`, clientData) // Send sound to a player
				}
			}
		} else {
			if (soundData.position !== undefined) { // Distanced sound - Nearby clients
				sockets.forEach(socket => {
					try {
						if (!socket.playerobject) return
						const distance = Game.pointDistance3D(socket.playerobject.position, soundData.position)

						let clientData = createClientData(soundData)

						let volume = distanceVolume(soundData, distance)

						if (!volume) return

						clientData.volume = volume

						socket.emit(`playSound`, clientData) // Send sound to players nearby
					} catch (error) {
						console.log(error)
					}
				})
			} else { // Global - All connected clients
				let clientData = createClientData(soundData)
				clientData.volume = 1
				return io.emit(`playSound`, clientData) // else just emit a global sound
			}
		}
	}

	function initSoundData(soundData) {
		if (soundData == undefined) return "sound-brick didn't get sound object"

		if (soundData.url == undefined) return "sound-brick didn't get sound url"

		if (soundData.isGlobal == undefined) return "sound-brick didn't get isGlobal"

		if (soundData.position !== undefined) {
			if (soundData.minDistance == undefined) {
				soundData.minDistance = 50
			}

			if (soundData.maxDistance == undefined) {
				soundData.maxDistance = 10
			}
		}

		if (soundData.isloop == undefined) {
			soundData.isloop = false
		}
	}

	function createClientData(soundData) { // clientData is an object that only contains what the client only needs. No reduntant variables here
		return clearVars(JSON.parse(JSON.stringify(soundData)))
	}

	function clearVars(clientData) { // Remove what is unneeded for the client
		delete clientData.isGlobal
		delete clientData.position
		delete clientData.minDistance
		delete clientData.maxDistance
		return clientData
	}

	function distanceVolume(clientData, distance) {
		if (distance < clientData.maxDistance) {
			return 1
		} else if (distance < clientData.minDistance) {
			return 1 - (distance / clientData.minDistance)
		}
		return false
	}

	function getPlayer(name) {
		for (let player of Game.players) {
			if (player.username.toLowerCase().indexOf(String(name).toLowerCase()) == 0) {
				const victim = Array.from(Game.players).find(p => p.username === player.username)
				return victim
			}
		}
	}

	Game.command("accept", (caller, args) => {
		if (caller.isLinked == false) {
			if (caller.isSocketWaiting == true) {
				caller.isSocketWaiting = false
				caller.soundSocket = caller.waitingSocket
				caller.isLinked = true

				caller.soundSocket.isLinked = true
				caller.soundSocket.playerobject = caller



				caller.message(`\\c5Accepted! Sound link complete`)

				playSound({
					url: `https://bunnynabbit.ddns.net/audio/soundbrickcore-confirm.ogg`,
					isGlobal: true,
					isloop: false,
					musiccredit: ""
				}, caller)
			}
		}
	})

	Game.on("playerJoin", (player) => {
		player.isSocketWaiting = false
		player.isLinked = false
		player.soundSocket = 0
	})

	Game.on("playerLeave", (player) => {
		if (player.isLinked == true) {
			playSound({
				url: `https://bunnynabbit.ddns.net/audio/soundbrickcore-disconnect.mp3`,
				isGlobal: true,
				isloop: false,
				musiccredit: "Refresh page and relink!",
			}, player)
		}
	})

	curCall = playSound
}

module.exports = call
// Don't Push the Button by Ezcha