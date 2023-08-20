const waitTime = 0.5 * 1000 * 60;
const config = require("./config.json");
const phin = require("phin").defaults({ timeout: 12000, headers: { Authorization: config.bearer }});
const fs = require("fs");
var latest=fs.readFileSync('latest.txt','utf8');
var latestBeta = fs.readFileSync('latestBeta.txt','utf8');
console.log(latest)
console.log(latestBeta)
const sleep = require("util").promisify(setTimeout);

const webhookid=config.webhookId
const webhooktoken=config.webhookToken

const Discord = require("discord.js");
const webhookClient = new Discord.WebhookClient({id:webhookid, token:webhooktoken});

async function debug() {
    const data = JSON.parse((await phin("https://api.brick-hill.com/v1/client/latestVersions/debug")).body)
    if (data.data && data.data[0].tag!=latest) {
	let timestamp = data.data[0].created_at.split(".")[0]+"+00:00"
        webhookClient.send(`@here New Debug Version. Latest found: ${data.data[0].tag}\n\`\`\`[debug.${data.data[0].tag}]\ncreated_at="${timestamp}"\`\`\``)
        console.log(latest)
        latest=data.data[0].tag
        fs.writeFileSync("./latest.txt", latest)
    } else {
	console.log(data)
    }
}

async function beta() {
    const data = JSON.parse((await phin("https://api.brick-hill.com/v1/client/latestVersions/release")).body)
    if (data.data && data.data[0].tag!=latestBeta) {
	let timestamp = data.data[0].created_at.split(".")[0]+"+00:00"
        webhookClient.send(`@here New Release Version. Latest found: ${data.data[0].tag}\n\`\`\`[release.${data.data[0].tag}]\ncreated_at="${timestamp}"\`\`\``)
        latestBeta=data.data[0].tag
        console.log(latestBeta)
        fs.writeFileSync("./latestBeta.txt", latestBeta)
    }
}

setInterval(debug,waitTime)
setInterval(beta,waitTime)