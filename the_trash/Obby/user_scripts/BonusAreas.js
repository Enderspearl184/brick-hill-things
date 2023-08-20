const bonusareas=[]
world.bricks.forEach((b) => {
	if (b.name.startsWith("bonustp")) {
		b.bonus = parseInt(b.name.replace("bonustp",""))
		b.touching((p) => {
			if (p.specialmode!==false || p.secrets.includes(b.bonus) || p.catmode) return
			bonusareas.forEach((tp) => {
				if (tp.bonus==b.bonus) {
					p.setPosition(new Vector3(tp.position.x+2,tp.position.y+2,tp.position.z+1))
				}
			})
		})
	}
	if (b.name.startsWith("bonusstart")) {
		b.bonus=parseInt(b.name.replace("bonusstart",""))
		bonusareas.push(b)
	}
	if (b.name.startsWith("bonusfinish")) {
		b.bonus=parseInt(b.name.replace("bonusfinish","")) 
		b.touching(async(p) => {
			if (!p.secrets.includes(b.bonus) && p.specialmode==false && !p.catmode) {
				p.secrets.push(b.bonus)
			} else return
			if (p.lives<=15) {
				p.lives=25
			} else p.lives+=10
	
			p.checkpoint+=1
			Game.checkpoints.forEach((b) => {
				if (b.checkpoint==p.checkpoint) {
					p.CheckPointPos=new Vector3(b.position.x+2,b.position.y+2,b.position.z+1)
				}
			})

			p.setScore(p.checkpoint)
			p.respawn()
			await sleep(10)
			p.message(`Your lives have been increased to ${p.lives}!`)
		})
	}
})