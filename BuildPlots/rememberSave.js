setInterval(function() {
	Game.messageAll("[#ff0000][SERVER]: [#ffffff]Remember to use /save to save your build!")
	Game.messageAll("[#ff0000][SERVER]: [#ffffff]So if you rejoin, you can /load your build and continue building it!")
	console.log("sending /save reminder")
}, 600000)