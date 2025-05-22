const { Client, EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const guildDb = require('../../../schemas/guild');
module.exports = {
	structure: {
		name: "invite",
		description: "invite me to your server!",
		cooldown: 50000,
	},
	/**
	 * @param {Client} client
	 * @param {Message<true>} message
	 * @param {string[]} args
	 */
	run: async (client, message, args) => {
		try {
			const image = 'https://i.pinimg.com/originals/f4/35/f1/f435f1c9bbf46f532f8119eeb5621126.gif'
            const embed = new EmbedBuilder()
            .setTitle('Invite Chimera!')
            .setDescription(`
            Explore Chimera's new features and commands!
            [Click here to invite Chimera!](https://discord.com/api/oauth2/authorize?client_id=1189594649954877620&permissions=8&scope=bot%20applications.commands)`)
            .setImage(image)
            .setURL('https://discord.com/api/oauth2/authorize?client_id=1189594649954877620&permissions=8&scope=bot%20applications.commands')
            .setColor('Random')
            .setThumbnail(client.user.displayAvatarURL())
            message.channel.send({ embeds: [embed], components:[
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setLabel('Invite Chimera!').setStyle('Link').setURL('https://discord.com/api/oauth2/authorize?client_id=1189594649954877620&permissions=8&scope=bot%20applications.commands').setEmoji('<:chimera_addguild:1189613407285035188>')
                )
            ] });

        } catch (err) {
            interaction.reply({
                content: 'There was an error. Please check my permissions.',
                ephemeral: true
            });
            console.error(err);
        }
	},
};