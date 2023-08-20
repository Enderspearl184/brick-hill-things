// Require the necessary discord.js classes
const fs = require('fs')
const { Client, Collection, Intents } = require('discord.js');
const { token } = require('./config.json');

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log('Ready!');
});

client.on("interactionCreate", async(interaction) => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	const botHasPerm = interaction.channel.permissionsFor(client.user, false).has('SEND_MESSAGES', false);
	if (!botHasPerm) return interaction.reply({content: "This command can't be used here!", ephemeral: true})

	try {
		await command.execute(interaction);
	} catch (err) {
		console.error(err)
		await interaction.followUp("There was an error.")
	}
})

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`)
	client.commands.set(command.data.name, command)
}

client.login(token);