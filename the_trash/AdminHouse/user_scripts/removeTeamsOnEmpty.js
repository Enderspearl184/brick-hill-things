Game.on("playerLeave", () => {
   if (Game.players.length==0) world.teams=[] //delete teams when everyone leaves to prevent complete spam
})