const nh = require('node-hill')

nh.startServer({
gameId: 37845, // Your game id here

port: 42483, // Your port id here (default is 42480)

local: false, // Whether or not your server is local
cli:false,
map: 'Home.brk',
mapDirectory:'./maps/',

scripts: './user_scripts', // Your .js files location

sandbox: {
	fs: require("fs")
}, // Your npm modules you want to add to the VM

modules: ['serverline','http','express','socket.io','fs'],

disabledCoreScripts:['admin.js'],

hostKey:""

// For more help: https://meta_data.gitlab.io/node-hill/interfaces/gamesettings.html
})

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
  console.log(reason.stack)
  // Application specific logging, throwing an error, or other logic here
});