const path="./../BuildExportBrk/exported/"
const fs=getModule("fs")
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }
  
  
  function toBRK(bricks) {
    if (!bricks) return
    let output = "B R I C K  W O R K S H O P  V0.2.0.0\n\n0 0 0\n0.14 0.51 0.20 1\n0.53 0.75 0.92\n100\n400\n\n"
  
    for (let brick of bricks) {
        let color = hexToRgb(brick.color)
        output += `${brick.position.x} ${brick.position.y} ${brick.position.z} ${brick.scale.x} ${brick.scale.y} ${brick.scale.z} ${(color.r) / 255} ${(color.g) / 255} ${(color.b) / 255} ${brick.visibility}\n`
        if (brick.name) {
            output += "    +NAME "+brick.name+"\n"
        }
        if (brick.shape) {
            output += "    +SHAPE "+brick.shape+"\n"
        }
        if (brick.rotation) {
            output += "    +ROT "+brick.rotation+"\n"
        }
        if (!brick.collision) {
            output+="    +NOCOLLISION\n"
        }
        if (brick.model) {
          output += "    +MODEL "+brick.model+"\n"
        }
    }
  
    return output
  }
  
  async function pushSave(p,bricks) {
    p.message("Converting bricks to .brk...")
    let brk = toBRK(bricks)
    p.message("Writing File...")
    fs.writeFileSync(path + p.userId + ".brk",brk)
    p.message("Done! Check the URL below to get the .brk file.")
    p.message(`https://enderspearl184.ddns.net:42488/${p.userId}`)
}
  
  Game.command("export", async(p)=>{
    p.message("Preparing bricks to be converted to .brk...")
    let SaveBricks=[]
      for (let bricks of world.bricks) {
          if (bricks.placedBy==p.userId && bricks.destroyed==false) {
  
              //await sleep(1)
  
              SaveBricks.push(bricks)
          }
      }
    pushSave(p,SaveBricks)
  })