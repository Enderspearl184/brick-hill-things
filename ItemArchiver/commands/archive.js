const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageAttachment } = require("discord.js")
const phin = require('phin').defaults({followRedirects:true})
const sleep = require('util').promisify(setTimeout)

const whitelistedGuilds = [
	869814274007126026,
	790086728144125983,
	1076778688940613632
]

const blacklistedTypes = [
	"tshirt",
	"shirt",
	"pants"
]

async function sendFile(interaction, fileobjs, id) {
	const files=[]
	for (let file of fileobjs) {
		files.push(new MessageAttachment((await phin(file.url)).body, file.name))
	}
	await interaction.editReply({content:`Archived Asset ${id}: `, files:files});
	return;
};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('archive')
		.setDescription('Sends the texture/mesh, and thumbnails for an item id!')
		.addIntegerOption(option => option.setName('id').setDescription('The item id to archive')
		.setRequired(true)),

	async execute(interaction) {
		const id = interaction.options.getInteger('id');
		if (!id) return interaction.reply("Item ID must be supplied");
		await interaction.reply(`Archiving asset ${id}`)

		const urls=[]

		const api = JSON.parse((await phin(`https://api.brick-hill.com/v1/shop/${id}`)).body.toString());
		if (api.error) return interaction.followUp(api.error.prettyMessage);

		//no leakers!!!!
		if (!api.data.is_public && !whitelistedGuilds.find((guild)=>guild==interaction.guildId)) return interaction.editReply(`Error archiving asset ${id}: ` + "Asset is not approved");
		if (api.data.creator.id!==1003 && blacklistedTypes.find((type)=>type==api.data.type.type) && !whitelistedGuilds.find((guild)=>guild==interaction.guildId)) return interaction.editReply({content: "Archiving user uploaded assets has been disabled.", ephemeral: true});

		urls.push({url:api.data.thumbnail, name:`${id}_thumbnail.png`})

		let response = (await phin(`https://api.brick-hill.com/v1/assets/getPoly/1/${id}`)).body.toString()
		console.log(response)
		let data = JSON.parse(response)

		if (data.error) return interaction.editReply(`Error archiving asset ${id}: ` + data.error.prettyMessage);

		data=data[0];

		if (data.mesh) {
			const mesh = data.mesh.slice(8)
			urls.push({url:`https://api.brick-hill.com/v1/assets/get/${mesh}`, name:`${id}_mesh.obj`})
		}
		if (data.texture) {
			const texture = data.texture.slice(8)
			urls.push({url:`https://api.brick-hill.com/v1/assets/get/${texture}`, name:`${id}_texture.png`})
		}
		await sendFile(interaction, urls, id)
	}
};