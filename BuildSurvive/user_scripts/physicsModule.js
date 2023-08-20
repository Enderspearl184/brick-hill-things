async function physicsMoveBot(bot,target, speed, bricks) {
    let canJump=false
    let hitWall=false
    let currentPosition = new Vector3(bot.position.x, bot.position.y, bot.position.z+(bot._zVelc || 0))
    speed *= 0.01
    if (target!==undefined) {
        if (target.position) {
            target=target.position
        }

        const angle = Math.atan2(target.y - bot.position.y, target.x - bot.position.x)
        bot.setRotation(new Vector3(0,0,-(angle * (180 / Math.PI)) + 270))
        currentPosition.x+=Math.cos(angle) * speed
        currentPosition.y+=Math.sin(angle) * speed
    }
    if (bot._zVelc==undefined) {
        bot._zVelc=0;
    }
    bot._zVelc-=0.025
    if (bot._zVelc<-0.75) {
        bot._zVelc=-0.75;
    }

    let d1xd;
    let d2xd;
    let d1yd;
    let d2yd;
    let d1zd;
    let d2zd;

    for (let brick of (bricks || world.bricks)) {
        if ((!brick.collision && brick.name!=="_bot") || brick==bot.brick) continue
        let d1x = brick.position.x - (currentPosition.x + bot.scale.x)
        if (d1x>=0) continue
        let d1y = brick.position.y - (currentPosition.y + bot.scale.y)
        if (d1y>=0) continue
        let d1z = brick.position.z - (currentPosition.z + (bot.scale.z*5))
        if (d1z>=0) continue

        let d2x = (currentPosition.x - (bot.scale.x)) - (brick.position.x  + brick.scale.x)
        if (d2x>=0) continue
        let d2y = (currentPosition.y - (bot.scale.y)) - (brick.position.y  + brick.scale.y)
        if (d2y>=0) continue
        let d2z = (currentPosition.z) - (brick.position.z  + brick.scale.z)
        if (d2z>=0) continue

        let largerX
        let largerY
        let largerZ
        if (d1x > d2x) {
            largerX = d1x
        } else {
            largerX = -d2x
        }
        if (d1y > d2y) {
            largerY = d1y
        } else {
            largerY = -d2y
        }
        if (d1z > d2z) {
            largerZ = d1z
        } else {
            largerZ = -d2z
        }


        if (largerZ<0 && Math.abs(largerZ)<Math.abs(largerX) && Math.abs(largerZ)<Math.abs(largerY) && !d2zd) {
            currentPosition.z+=largerZ
            bot._zVelc=0
            canJump=false
        } else if (largerZ>0 && bot._zVelc<=0 && Math.abs(largerZ)+speed<Math.abs(largerX) && Math.abs(largerZ)+speed<Math.abs(largerY) && !d1zd) {
            currentPosition.z+=largerZ
            bot._zVelc=0
            canJump=true
        } else if (Math.abs(largerX)>Math.abs(largerY)) {
            currentPosition.y+=largerY
            hitWall=true
        } else if (Math.abs(largerX)<Math.abs(largerY)) {
            currentPosition.x+=largerX
            hitWall=true
        } else {
            currentPosition.x+=largerX
            currentPosition.y+=largerY
            hitWall=true
        }
    }

    if (canJump && hitWall) {
        bot._zVelc=0.8
    }
    bot.setPosition(currentPosition)
}

module.exports=physicsMoveBot