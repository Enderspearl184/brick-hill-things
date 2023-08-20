/*

Cheats' V2 COMMANDS


You do NOT need to spell out full username's of users; if the user's username is 2 or more words type the first word/part.
In commands like jump, speed, god, etc. you do not need to say your username, you can use it like /speed 10 (which will set your speed to 10) or /god (which will give you infinite health).

Commands (* means that is a toggle-able command):
/kill player - kills the player.
/vchat message - sends a message to everyone in the game that is also an admin.
/unban player id - unbans the player via their user id.
/tp player or x,y,z - teleports you to a player or teleports you to a coordinate. Example: /tp cheats OR /tp 0,0,0.
/god ?player - gives you infinite health or the player infinite health.
/speed ?player num - sets the player's speed to the num. *NOTE You can do /speed 10 to set your speed to 10.
/jump ?player num - sets the player's jump power to the num. *NOTE You can do /jump10 to set your jump power to 10.
/weather env - sets the weather of the Game (sun,snow,rain)
/freeze player - freezes the player.
/thaw player - thaws the player. *NOTE can't thaw a player that is not frozen.
/av id or reset - sets your avatar id to the specified one. say /av reset to reset your avatar
/server message - sends a server message
/tpme player - teleports said player to you.
/ambient color - sets the game's ambient color in hexadecimal or hex. Example: /ambient 69 OR /ambient #ff0000.
/sky color - sets the game's sky color hexadecimal or hex. Example: /sky 69 OR /sky #ff0000.
/team name - creates a team with the given name with a random color and puts you on it.

*/

const ADMINS = [1,305122] /////////////// Put your ID in this table
const BANNED = []
const BANNED_IPS = ["420.0.0.1"]
const COLORS = [
    blue = "#0066ff",
    red = "#ff0000",
    yellow = "#ffff00",
    purple = "#6f00ff",
    pink = "#ff00d0",
    orange = "#ff8800",
    green = "#22ff00"
]
const DELETEBRICKS = []

let freezeOutfit = new Outfit()
    .body("#0091ff")

function getPlayer(name) {
    for (let player of Game.players) {
        if (player.username.toLowerCase().indexOf(String(name).toLowerCase()) == 0) {
            const victim = Array.from(Game.players).find(p => p.username === player.username)
            return victim
        }
    }
}

function isAdmin(userId) {
    return ADMINS.includes(userId)
}

function v1(msg) {
    return `[#ff0000][V2]: [#ffffff]${msg}`
}
//!BANNED_IPS.includes(String(player.socket.IPV4)) && 
Game.on("playerJoin", player => {
    player.on("initialSpawn", () => {
        player.frozen = false;
  	player.message(v1("Check the description for the admin command list. Have fun!"))
        player.centerPrint(v1("You are an admin on this server."),3)
        if (!BANNED.includes(player.userId)) return;
        return player.kick("You are banned from this game.")
    })
})

Game.command("kill", (p,m) => {
    const v = getPlayer(m);
    if (!v) return;
    return v.kill();
})

Game.command("kick", (p,m) => {
    if (!isAdmin(p.userId)) return;
    const a = m.split(" ")
    const v = getPlayer(String(a.splice(0,1)));
    if (!v) return;
    if (!a.length) return v.kick();
    return v.kick(a.join(" "))
})

Game.command("clear", (p,m) => {
    if (!isAdmin(p.userId)) return;
    for (let bricks of Game.world.bricks) {
    	if (bricks.Placed==true) bricks.destroy()
    }
})

Game.command("mute", (p,m) => {
    if (!isAdmin(p.userId)) return;
    const v = getPlayer(m);
    if (!v) return;
    p.message(v1(`You muted ${v.username}`))
    return v.muted = !v.muted
})

Game.command("vchat", (p,m) => {
    for (let index of ADMINS) {
        const a = Array.from(Game.players).find(p => p.userId === index)
        a.message(`[#ff0000][${p.username}]: [#ffffff]${m}`)
    }
})

Game.command("ban", (p,m) => {
    if (!isAdmin(p.userId)) return
    const v = getPlayer(m);
    if (!v) return;

    BANNED.push(v.userId);
    p.message(v1(`You banned [#ff0000]${v.username}[#ffffff].`))
    return v.kick("You are banned from this game.")
})

Game.command("admin", (p,m) => {
    if (!isAdmin(p.userId)) return
    const v = getPlayer(m);
    if (!v) return;

    if (ADMINS.includes(v.userId)) {
        ADMINS.splice(ADMINS.indexOf(v.userId), 1);
        return p.message(v1(`You took away [#ff0000]${v.username}[#ffffff]'s admin.`))
    }

    ADMINS.push(v.userId)
    v.message(v1("You are now an admin."))
    return p.message(v1(`You gave[#ff0000] ${v.username} [#ffffff]admin.`))
})

Game.command("tp", (p, place) => {
    if (place.indexOf(',') !== -1) {
        const coords = place.split(',');
        if (coords[0], coords[1], coords[2]) {
            try {
                return p.setPosition(new Vector3(Number(coords[0]),Number(coords[1]),Number(coords[2])))
            } catch {}
        }
    } else {
        const v = getPlayer(place);
        if (v) {
            try {
                return p.setPosition(v.position)
            } catch {}
        }
    }
})

Game.command("god", (p,m) => {
    const v = getPlayer(m)
    return (v) ? v.setHealth(Number.POSITIVE_INFINITY) : p.setHealth(Number.POSITIVE_INFINITY);
});

Game.command("speed", (p,m) => {
    const a = m.split(" ")
    const v = getPlayer(a[0]);
    return (v) ? v.setSpeed(Number(a[1])) : p.setSpeed(Number(a[0]))
})

Game.command("jump", (p,m) => {
    const a = m.split(" ")
    const v = getPlayer(a[0]);
    return (v) ? v.setJumpPower(Number(a[1])) : p.setJumpPower(Number(a[0]))
})

Game.command("size", (p, m) => {
    if (!(isAdmin(p.userId) || p.ownsAsset(147324))) return p.message("You need to own https://www.brick-hill.com/shop/147324 to do that.")
    if (m.split(" ")[0]=="me" || m.split(" ")[0]=="all" || m.split(" ")[0]=="others") return p.message("That will probably crash the game... Chances are no one in this server is named all, me, or others. Use /size num OR /size plr num instead")
    if (m==undefined) return p.message("Do /size plr num to change someone's size or do /size num to change your own size.")
    const v = getPlayer(m.split(" ")[0])
    if (v) {
        s = m.split(" ")[1].split(",");
        try {if (s.length < 3) return v.setScale(new Vector3(s[0],s[0],s[0]))} catch {}
        return v.setScale(new Vector3(s[0],s[1],s[2]))
    }

    const a = m.split(",");
    try {if (a.length < 3) return p.setScale(new Vector3(a[0],a[0],a[0]))} catch{}
    return p.setScale(new Vector3(a[0],a[1],a[2]))
});

Game.command('weather', (p, e) => {
    try {
        return Game.setEnvironment({
            weather: e
        })
    } catch {}
});

Game.command("freeze", (p,m) => {
    const v = getPlayer(m)
    if (!v) return;
    
    v.setOutfit(freezeOutfit)
    v.frozen = true
    v.setSpeed(0)
    v.setJumpPower(0)
    return v.centerPrint(v1(`You were frozen by ${p.username}.`),3)
})

Game.command("thaw", async (p,m) => {
    const v = getPlayer(m)
    if (!v) return
    if (!v.frozen) return
    await v.setAvatar(v.userId)
    v.setSpeed(4)
    v.setJumpPower(5)
    return v.centerPrint(v1(`You were thawed by ${p.username}.`),3)
})

Game.command("av", async (p,m) => {
    if (m === "reset") return await p.setAvatar(p.userId)
    if (isNaN(m)) return;
    return await p.setAvatar(m)
})

Game.command("tpme", (p,m) => {
    const v = getPlayer(m);
    if (!v) return;
    return v.setPosition(p.position)
})

Game.command("server", (p,m) => {
    console.log(p.username,m)
    return Game.messageAll(`[#ff0000][SERVER]: [#ffffff]${m}`)
})

Game.command("ambient", (p,m) => {
    try {
        return Game.setEnvironment({ambient: m})
    } catch {}
})

Game.command("sky", (p,m) => {
    try {
        return Game.setEnvironment({skyColor: m})
    } catch {}
})

Game.command("team", (p,m) => {
    const existTeam = world.teams.find((t)=>t.name.toLowerCase().startsWith(m.toLowerCase()))
    if (existTeam) return p.setTeam(existTeam)
    const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    const team = new Team(m, randomColor);
    Game.newTeam(team)
    p.setTeam(team);
    return Game.messageAll(v1(`${p.username} created [#ff0000]${m}[#ffffff].`))
})


Game.command("rename", (player,name)=> {
	let packet=new PacketBuilder("Authentication")
	.write("uint32", player.netId)
        .write("uint32", world.bricks.length)
        .write("uint32", player.userId)
	.write("string", name)
        .write("bool", player.admin)
        .write("uint8", player.membershipType)
        .write("uint32", Game.gameId)
	.write("string", "A Brick-Hill Game")
	.send(player.socket)
	return player.message("Only you can see your changed name, and it will not change your name in chat.")
})


Game.command("score", (p,args)=> {
	let split = args.split(" ")
	if (!split[0] || !isFinite(split[1])) return p.message("Missing or invalid parameters. /score NAME SCORE")
	let score = parseInt(split[1])
	if (score<-2147483648) score = -2147483648
	if (score>2147483647) score = 2147483647
	let v = getPlayer(split[0])
	v.setScore(score)
})