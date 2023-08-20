Game.on("playerJoin", (player) => {
    new PacketBuilder("PlayerModification")
        .write("string", "TweakDisableLighting")
        .send(player.socket)
})

/*
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
    p.newBrick(brick)
    let lastposition=p.position
    brick.setInterval(() => {
        if (p.destroyed) brick.destroy()
        if (p.position.x !== lastposition.x || p.position.y !== lastposition.y || p.position.z !== lastposition.z) {
            lastposition.x = p.position.x
            lastposition.y = p.position.y
            lastposition.z = p.position.z+8
            brick.setPosition(new Vector3(p.position.x-2,p.position.y-2,p.position.z+8))
        }
    }, 100);
}
*/