const nh = require('node-hill')

nh.startServer({
gameId: 37847, // Your game id here

port: 42487, // Your port id here (default is 42480)

local: false, // Whether or not your server is local
cli:true,
map: 'Home.brk',
mapDirectory:'./maps/',

scripts: './user_scripts', // Your .js files location

modules:['phin','serverboy','fs',"node:process"],
hostKey:""

// For more help: https://meta_data.gitlab.io/node-hill/interfaces/gamesettings.html
})