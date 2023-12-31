var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const FALL_HEIGHT = -150; // How far the player can fall below the baseplate
Game.on("playerJoin", (p) => {
    p.on("died", () => __awaiter(this, void 0, void 0, function* () {
	if (p.invincible) return p.respawn()
        for (let i = 0; i < 3; i++) {
            p.topPrint(`You will respawn in ${3 - i} seconds.`);
            yield sleep(1000);
        }
        return p.respawn();
    }));
    p.setInterval(() => {
        if (p.alive && p.position.z <= FALL_HEIGHT) {
            return p.kill();
        }
    }, 1000);
});
