const nh = require('node-hill')

nh.startServer({
gameId: 25549, // Your game id here

hostKey:"",

port: 42486, // Your port id here (default is 42480)
cli:false,
local: false, // Whether or not your server is local
mapDirectory:'./maps/',
map: 'Home.brk',

scripts: './user_scripts', // Your .js files location

sandbox: {}, // Your npm modules you want to add to the VM

// For more help: https://meta_data.gitlab.io/node-hill/interfaces/gamesettings.html
})