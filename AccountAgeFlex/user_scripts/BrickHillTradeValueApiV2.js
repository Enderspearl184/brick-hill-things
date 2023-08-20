const phin=getModule('phin')
    .defaults({
    parse: "json",
    timeout: 12000
});
const API = "https://api.brick-hill.com/v1/user/";
async function getUserTradeInfo(userId) {
    let data = await phin({url: API + userId + "/value"})
    return data.body
}

async function getTradeInfo(p) {
	var TradeInfo = await getUserTradeInfo(p.userId)
	console.log(TradeInfo)
	if (!TradeInfo.value) {
		p.NoTradeInfo = true
		console.log("Failed to retrieve value data.")
	} else p.NoTradeInfo = false

	if (p.NoTradeInfo==false && TradeInfo.value) {
		p.TradeInfo = TradeInfo
		console.log("Value: " + TradeInfo.value)
		console.log("Direction: " + TradeInfo.direction)
	}
}

module.exports=getTradeInfo