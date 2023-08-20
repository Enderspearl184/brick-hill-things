const nh = require('node-hill')

nh.startServer({
gameId: 37846, // Your game id here

port: 42484, // Your port id here (default is 42480)

local: false, // Whether or not your server is local

hostKey:"",

map: 'Home.brk',
mapDirectory:'./maps/',

scripts: './user_scripts', // Your .js files location

modules: ["http", "serverline"] // npm modules to allow in sandbox

// For more help: https://meta_data.gitlab.io/node-hill/interfaces/gamesettings.html
})