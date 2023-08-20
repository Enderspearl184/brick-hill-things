const nh = require('node-hill')

nh.startServer({
    gameId: 25551, // Your game id here

    port: 42480, // Your port id here (default is 42480)

    local: true, // Whether or not your server is local
    mapDirectory:'./maps',
    map: 'maptools.brk', //- Your .brk file location here
    
    scripts: './user_scripts', // Your .js files location
	modules: [],

    sandbox: {} // Your npm modules you want to add to the VM 

    // For more help: https://meta_data.gitlab.io/node-hill/interfaces/gamesettings.html
})