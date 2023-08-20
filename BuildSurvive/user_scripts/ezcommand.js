//this script allows players to use commands by chatting starting with other characters


const commandCharacters=[";" , ":"] //add characters that if a chat message starts with, it triggers a command

Game.on("playerJoin", (p) => {
	p.on("chatted", (msg) => {
		for (let chars of commandCharacters) {
			if (msg.startsWith(chars)) return activateCommand(p, msg)
		}
	})
})

function activateCommand(p, msg) {
		//gets the command from the string (everything after first character)
		let cmd = msg.split(msg.charAt(0))[1].split(" ")[0]

		//gets the arguments from the string (everything after first space)
		let args = msg.split(msg.charAt(0))[1].split(/ (.+)/)[1]
		
		//activates the command
		Game.emit('command', cmd, p, args)
}