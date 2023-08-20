const nh = require('node-hill')

nh.startServer({
    gameId: 25550, // Your game id here
    hostKey:"",
    port: 42482, // Your port id here (default is 42480)

    local: false, // Whether or not your server is local

    mapDirectory:'./maps',

    map: 'map.brk', //- Your .brk file location here
    
    scripts: './user_scripts', // Your .js files location

    sandbox: {}, // Your npm modules you want to add to the VM 

    modules: ['serverline','fs'],

    disabledCoreScripts: ['respawn.js']

    // For more help: https://meta_data.gitlab.io/node-hill/interfaces/gamesettings.html
})