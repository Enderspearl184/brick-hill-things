/*
Game.on("playerJoin", (player) => {
    new PacketBuilder("PlayerModification")
        .write("string", "TweakDisableLighting")
        .send(player.socket)
})
*/
Game.on("playerJoin", (player) => {
    player.on("initialSpawn", () => {
        createBrick(player)
    })
})

async function createBrick(p) {
    let brick = new Brick(new Vector3(1, 1, 1), new Vector3(4, 4, 4), "#f54242")
    brick.visibility = 0
    brick.collision=false
    brick.name="dns"
    brick.lightEnabled=true
    brick.lightRange=1000
    brick.lightColor="#b1b1b1"
    brick.position=new Vector3(1000,1000,1000)
    brick=await p.newBrick(brick)
    p.on('moved',(pos)=>{
	brick.setPosition(new Vector3(pos.x-8,pos.y-8,pos.z+8))
    })
}