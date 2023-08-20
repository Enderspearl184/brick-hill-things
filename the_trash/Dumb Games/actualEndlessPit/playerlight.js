 Game.on("playerJoin", (player) => {
    player.on("initialSpawn", () => {
        createBrick(player)
    })
})

async function createBrick(p) {
    let brick = new Brick(new Vector3(1, 1, 1), new Vector3(4, 4, 5), "#f54242")
    brick.collision=false
    brick.visibility=0
    brick.lightEnabled=true
    brick.lightRange=150
    brick.lightColor="#606060"

    brick=await p.newBrick(brick)
    let lastposition=new Vector3(0,0,0)
    p.setInterval(() => {
        if (p.destroyed) brick.destroy()
        if (p.position.x !== lastposition.x || p.position.y !== lastposition.y || p.position.z !== lastposition.z) {
            lastposition.x = p.position.x
            lastposition.y = p.position.y
            lastposition.z = p.position.z
            brick.setPosition(new Vector3(p.position.x-2,p.position.y-2,p.position.z))
        }
    }, 100);
}