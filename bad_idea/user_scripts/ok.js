const romName="pokemon"
const romPath="./"
const romExt=".gb"

let Gameboy = getModule("serverboy")
let fs = getModule("fs")

var gameboy = new Gameboy();
var rom = fs.readFileSync(romPath+romName+romExt);

var save
let maxTime = 10
let time = maxTime+1

if (fs.existsSync(romPath+romName+".sav")) {
    save = fs.readFileSync(romPath+romName+".sav")
}

gameboy.loadRom(rom,save);

let keyvote=[]
for (let key of Object.keys(Gameboy.KEYMAP)) {
    keyvote.push({key:key,votes:0})
}
console.log(keyvote)

Game.on("chatted", (player, message) => {
    console.log(message)
    switch (message.toLowerCase()) {
        case "right":
            keyvote[Gameboy.KEYMAP.RIGHT].votes++
            if (keyvote[Gameboy.KEYMAP.RIGHT].votes>Game.players.length/2) time=1
            if (player.vote) {
                keyvote[parseInt(player.vote)].votes--
            }
            player.vote=0.1
            break;
        case "left":
            keyvote[Gameboy.KEYMAP.LEFT].votes++
            if (keyvote[Gameboy.KEYMAP.LEFT].votes>Game.players.length/2) time=1
            if (player.vote) {
                keyvote[player.vote].votes--
            }
            player.vote=1
            break;
        case "up":
            keyvote[Gameboy.KEYMAP.UP].votes++
            if (keyvote[Gameboy.KEYMAP.UP].votes>Game.players.length/2) time=1
            if (player.vote) {
                keyvote[player.vote].votes--
            }
            player.vote=2
            break;
        case "down":
            keyvote[Gameboy.KEYMAP.DOWN].votes++
            if (keyvote[Gameboy.KEYMAP.DOWN].votes>Game.players.length/2) time=1
            if (player.vote) {
                keyvote[player.vote].votes--
            }
            player.vote=3
            break;
        case "a":
            keyvote[Gameboy.KEYMAP.A].votes++
            if (keyvote[Gameboy.KEYMAP.A].votes>Game.players.length/2) time=1
            if (player.vote) {
                keyvote[player.vote].votes--
            }
            player.vote=4
            break;
        case "b":
            keyvote[Gameboy.KEYMAP.B].votes++
            if (keyvote[Gameboy.KEYMAP.B].votes>Game.players.length/2) time=1
            if (player.vote) {
                keyvote[player.vote].votes--
            }
            player.vote=5
            break;
        case "select":
            keyvote[Gameboy.KEYMAP.SELECT].votes++
            if (keyvote[Gameboy.KEYMAP.SELECT].votes>Game.players.length/2) time=1
            if (player.vote) {
                keyvote[player.vote].votes--
            }
            player.vote=6
            break;
        case "start":
            keyvote[Gameboy.KEYMAP.START].votes++
            if (keyvote[Gameboy.KEYMAP.START].votes>Game.players.length/2) time=1
            if (player.vote) {
                keyvote[player.vote].votes--
            }
            player.vote=7
            break;
    }
})

let bricks = []
let firstBrick = Game.world.bricks[0]
//bricks.push(firstBrick)
let startPos = firstBrick.position
Game.clearMap()
for (let i=0;i<160;i++) {
    for (let j=0;j<144;j++) {
        let brick = firstBrick.clone()
        brick.position = new Vector3(startPos.x,startPos.y-(0.25*i),startPos.z+(0.25*j))
        brick.collision=false
        bricks[(i+(j*160))]=brick
    }
}
Game.loadBricks(bricks)
bricks = bricks.reverse()

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

let frameCount=240
function runFrames(){
    let highestVoteKey
    let highestVoteTotal=1
    for (let vote of keyvote){
        if (vote.votes>=highestVoteTotal) {
            highestVoteKey=vote.key
            highestVoteTotal=vote.votes
        }
        vote.votes=0
    }
    for (let player of Game.players) {
        player.vote=null
    }
    console.log(highestVoteKey)
    let pressedCount=0
    for (let j=0;j<frameCount;j++){
        if (highestVoteKey) {
            console.log(Gameboy.KEYMAP[highestVoteKey])
            gameboy.pressKey(Gameboy.KEYMAP[highestVoteKey])
            pressedCount++
            if (pressedCount>=5) {
                highestVoteKey=null
            }
        }
        gameboy.doFrame();
    }
    var screen = gameboy.getScreen();
    for (let i=0;i<(screen.length/4);i++) {
        let reali = i*4
        let hex = rgbToHex(screen[reali],screen[reali+1],screen[reali+2])
        let brick = bricks[i]
        if (brick.color!==hex) {
            brick.setColor(hex)
        }
    }
    //Game.clearMap()
    //Game.world.bricks=[]
    //Game.loadBricks(bricks)
    console.log("frames done")
    //draw to thing idk
}

setInterval(()=>{
    //console.log(keyvote)
    let highestVoteKey
    let highestVoteTotal=1
    for (let vote of keyvote){
        if (vote.votes>=highestVoteTotal) {
            highestVoteKey=vote.key
            highestVoteTotal=vote.votes
        }
    }
    time--
    Game.topPrintAll("Timer: " + time + " Voted Button: " + highestVoteKey,10000)
    if (time==0) {
        runFrames()
        time=maxTime+1
    }
},1000)

Game.command("frames",(p,a)=>{
    if (parseInt(a) && a==parseInt(a) && (p.userId=305122 || Game.local)) {
        frameCount=a
        p.message("frames changed :)")
    } else {
        p.message(frameCount)
    }
})

Game.command("time",(p,a)=>{
    if (parseInt(a) && a==parseInt(a) && (p.userId=305122 || Game.local)) {
        console.log("time")
        maxTime=parseInt(a)
        p.message(maxTime.toString())
        p.message("max time changed :)")
    } else {
        p.message(maxTime)
    }
})

Game.command("currenttime",(p,a)=>{
    if (parseInt(a) && a==parseInt(a) && (p.userId=305122 || Game.local)) {
        console.log("currenttime")
        time=parseInt(a)
        p.message("current time changed :)")
    } else {
        p.message(time)
    }
})


let isSaving=false
function saveFile() {
    if (!isSaving) {
        isSaving=true
        fs.writeFileSync(romPath+romName+".sav",Buffer.from(gameboy.getSaveData()))
        isSaving=false
    }
}

Game.command("reset",(p)=>{
    if (p.userId=305122 || Game.local) {
        console.log("reset")
        saveFile()
        gameboy=new Gameboy()
        fs.readFileSync(romPath+romName+romExt);

        if (fs.existsSync(romPath+romName+".sav")) {
            save = fs.readFileSync(romPath+romName+".sav")
        }

        gameboy.loadRom(rom,save)
    }
})

Game.command("forcereset",(p)=>{
    if (p.userId=305122 || Game.local) {
        console.log("forcereset")
        //saveFile()
        gameboy=new Gameboy()
        fs.readFileSync(romPath+romName+romExt);

        if (fs.existsSync(romPath+romName+".sav")) {
            save = fs.readFileSync(romPath+romName+".sav")
        }

        gameboy.loadRom(rom,save)
    }
})

Game.command("save",(p)=>{
    console.log("save")
    saveFile()
    p.message("saved SRAM to file")
})

const process=getModule("node:process")

process.on("SIGINT", function() {
    console.log( "\ngracefully shutting down from SIGINT (Crtl-C)" );
    process.exit();
} );

process.on( "exit", function() {
    //console.log(gameboy.getSaveData())
    saveFile()
} );


Game.save=function(){saveFile()}
Game.reset=function(){Game.emit("command","reset",{userId:305122})}
Game.time=function(a){Game.emit("command","time",{userId:305122})}
Game.frames=function(a){Game.emit("command","frames",{userId:305122},a)}
Game.currenttime=function(a){Game.emit("command","currenttime",{userId:305122},a)}
Game.forcereset=function(){Game.emit("command","forcereset",{userId:305122})}