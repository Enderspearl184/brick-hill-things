const FALL_HEIGHT = -4500;
Game.on("playerJoin", (p) => {
    p.on("died", async() => {
        for (let i = 0; i < 5; i++) {
            p.topPrint(`You will respawn in ${5 - i} seconds.`);
            await sleep(1000);
        }
        return p.respawn();
    });
    p.setInterval(() => {
        if (p.alive && p.position.z <= FALL_HEIGHT) {
            return p.kill();
        }
    }, 1000);
});
