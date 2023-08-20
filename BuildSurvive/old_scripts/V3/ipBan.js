//how to use:
//put your user id in the OWNERID variable before using.
//use /ipban (name) to ipban a user.
//use /listipbans to print all banned ips to the console
//use /unipban (ip) to unban an ip.

const OWNERID=305122 //put your userid here
const IPBANS=[] //put ips to always ban here
const SAFEIPS=["127.0.0.1"]//put your IP in here. note: 127.0.0.1 is localhost so don't remove it if you join from the same device.

Game.on("playerJoin", (p) => {
	if (IPBANS.includes(p.socket.IPV4)) return p.kick("You are IP banned")
})

Game.command("ipban", (p,m) => {
    if (p.userId!==OWNERID && !Game.local) return
    const v = getPlayer(m);
    if (!v) return;
	
    if (v.socket.IPV4==p.socket.IPV4 || SAFEIPS.includes(v.socket.IPV4)) return p.message("Unable to IP ban. This IP is in the SAFEIPS array, or is your own IP.")

    IPBANS.push(v.socket.IPV4);
    console.log(`You ip banned ${v.socket.IPV4}.`)
    for (let player of Game.players) {
	if (IPBANS.includes(player.socket.IPV4)) player.kick("You have been IP banned.")
    }
})

Game.command("unipban", (p,ip) => {
	if (p.userId!==OWNERID && !Game.local) return
	if (IPBANS.includes(ip)) {
		IPBANS.splice(IPBANS.indexOf(ip), 1)
		console.log
	}
})

Game.command("listipbans", (p, args) => {
	console.log(IPBANS)
})


//copied from cheats commands v2 because it works
function getPlayer(name) {
    for (let player of Game.players) {
        if (player.username.toLowerCase().indexOf(String(name).toLowerCase()) == 0) {
            const victim = Array.from(Game.players).find(p => p.username === player.username)
            return victim
        }
    }
}