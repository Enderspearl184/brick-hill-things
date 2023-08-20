const nh = require('node-hill')

nh.startServer({
gameId: 23455, // Your game id here

port: 42481, // Your port id here (default is 42480)
hostKey:"",
local: false, // Whether or not your server is local

map: 'Home.brk',
mapDirectory:'./maps',

scripts: './user_scripts', // Your .js files location

sandbox: {} // Your npm modules you want to add to the VM

// For more help: https://meta_data.gitlab.io/node-hill/interfaces/gamesettings.html
})