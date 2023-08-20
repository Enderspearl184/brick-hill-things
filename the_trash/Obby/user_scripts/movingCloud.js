let cloud = world.bricks.find(brick => brick.name=="movingCloud")
const defaultSpeed=0.125
if (cloud) {
	cloud.speed=defaultSpeed
	cloud.timer=0
	cloud.setInterval(async function() {
		if (cloud.timer<=0) {
			cloud.setPosition(new Vector3(cloud.position.x, cloud.position.y+cloud.speed, cloud.position.z))
			cloud.timer=0
		} else {
			cloud.timer-=10
		}
		if (cloud.position.y<=16) {
				cloud.speed=defaultSpeed
				cloud.timer=5000
				cloud.position.y=16.5
		} else if (cloud.position.y>=216) {
				cloud.speed=-defaultSpeed*2.5
				cloud.timer=5000
				cloud.position.y=215.5
		}
		cloud.timer-=10
	}, 10)
	cloud.touching((p) => {})
	
}