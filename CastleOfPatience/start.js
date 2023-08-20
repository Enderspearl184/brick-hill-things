const nh = require('node-hill')

nh.startServer({
gameId: 25550, // Your game id here

port: 42485, // Your port id here (default is 42480)

local:false, // Whether or not your server is local
cli:false,
map: 'Home.brk',
mapDirectory:'./maps/',

scripts: './user_scripts', // Your .js files location

modules: ["phin",'serverline'],

sandbox: {
	http: require("http")
}, // Your npm modules you want to add to the VM
hostKey:""

// For more help: https://meta_data.gitlab.io/node-hill/interfaces/gamesettings.html
})