const nh = require('node-hill')

nh.startServer({
gameId: 24789, // Your game id here

port: 42480, // Your port id here (default is 42480)

local: false, // Whether or not your server is local

map: './maps/Home.brk',

scripts: './user_scripts', // Your .js files location

sandbox: {}, // Your npm modules you want to add to the VM

cheatsAdmin: {
	admins:[305122],
	audit: true,
	allowEval: true,
	immunity: true,
	safeCommands: false
}

// For more help: https://meta_data.gitlab.io/node-hill/interfaces/gamesettings.html
})