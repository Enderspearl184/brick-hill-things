const nh = require('node-hill')

nh.startServer({
gameId: 23455, // Your game id here

port: 42482, // Your port id here (default is 42480)

local: false, // Whether or not your server is local
cli:false,
map: 'AccAgeTower.brk',
mapDirectory:'./maps/',

scripts: './user_scripts', // Your .js files location

modules:['phin'],
hostKey:""

// For more help: https://meta_data.gitlab.io/node-hill/interfaces/gamesettings.html
})