//this first part is just copied from the getUserInfo js script with the api url changed.

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const phin = require("phin")
    .defaults({
    parse: "json",
    timeout: 12000
});
const API = "https://brick-hill.trade/api/extension/user/";
function getUserTradeInfo(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        return (yield phin({ url: API + userId })).body
    });
}

Game.on("playerJoin", async(p) => {
	var TradeInfo = await getUserTradeInfo(p.userId)
	if (TradeInfo.status=="error") {
		p.NoTradeInfo = true
		console.log("Failed to retrieve brick-hill.trade data.")
	} else p.NoTradeInfo = false

	if (p.NoTradeInfo==false) {
		p.TradeInfo = TradeInfo.user
		console.log("Value: " + p.TradeInfo.value)
		console.log("Average: " + p.TradeInfo.average)
		console.log("Specials: " + p.TradeInfo.specials)
		console.log("Value Rank: " + p.TradeInfo.rank)
	}
})