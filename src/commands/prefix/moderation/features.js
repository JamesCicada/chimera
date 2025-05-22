const { Client, ActionRowBuilder, ButtonBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const guildDb = require('../../../schemas/guild');
module.exports = {
	structure: {
		name: "features",
		description: "Check and manage features!",
		cooldown: 15000,
	},
	/**
	 * @param {Client} client
	 * @param {Message<true>} message
	 * @param {string[]} args
	 */
	run: async (client, message, args) => {
		try {
			if(!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
				return message.reply(`You don't have perms to use this command!`)
			}
			const interaction = message;
            interaction.reply({
                content: `<a:chimera_loading:1189609175840460961> **Loading Features List...**`
            }).then(async (msg) => {
                let guildData = await guildDb.findOne({
                    guildId: interaction.guild.id
                });

                if (!guildData) {
                    await guildDb.create({
                        guildId: interaction.guild.id
                    });
                }

                guildData = await guildDb.findOne({
                    guildId: interaction.guild.id
                });

                const embed = new EmbedBuilder()
                    .setColor('DarkButNotBlack')
                    .setThumbnail(client.user.displayAvatarURL())
                    .setTitle('Features Control Panel')
                    .setDescription(`
                    > Welcoming Status: ${getFeatureStatusText(guildData.welcomeStatus)}

                    > Leaving Status: ${getFeatureStatusText(guildData.byeStatus)}

                    > Logs Status: ${getFeatureStatusText(guildData.logsStatus)}

                    > Boosts Alerts: ${getFeatureStatusText(guildData.boostStatus)}

                    > Bots Whitelist: ${getFeatureStatusText(guildData.botsWlStatus)}

                    > Prefix Commands: ${getFeatureStatusText(guildData.prefixStatus) ? `${getFeatureStatusText(guildData.prefixStatus)} \`${guildData.prefix || '!'}\`` : getFeatureStatusText(guildData.prefixStatus)}
                `);


                const buttons = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('welcome-toggle')
                            .setLabel('Welcoming')
                            .setStyle(getButtonStyle(guildData.welcomeStatus)),
                        new ButtonBuilder()
                            .setCustomId('bye-toggle')
                            .setLabel('Leaving')
                            .setStyle(getButtonStyle(guildData.byeStatus)),
                        new ButtonBuilder()
                            .setCustomId('logs-toggle')
                            .setLabel('Logs')
                            .setStyle(getButtonStyle(guildData.logsStatus))
                    );

                const buttons2 = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('boost-toggle')
                            .setLabel('Boost Alerts')
                            .setStyle(getButtonStyle(guildData.boostStatus)),
                        new ButtonBuilder()
                            .setCustomId('botwl-toggle')
                            .setLabel('Bots Whitelist')
                            .setStyle(getButtonStyle(guildData.botsWlStatus)),
                        new ButtonBuilder()
                            .setCustomId('prefix-toggle')
                            .setLabel('Prefix Whitelist')
                            .setStyle(getButtonStyle(guildData.prefixStatus))
                    );

                msg.edit({
                    content: '',
                    embeds: [embed],
                    components: [buttons, buttons2]
                });
            });

        } catch (err) {
            interaction.reply({
                content: 'There was an error. Please check my permissions.',
                ephemeral: true
            });
            console.error(err);
        }
	},
};
function getFeatureStatusText(status) {
    const onEmoji = '<:chimera_switchon:1189609942567616512>';
    const offEmoji = '<:chimera_switchoff:1189610234587664534>';
    return status ? `**ON** ${onEmoji}` : `**OFF** ${offEmoji}`;
}

function getButtonStyle(status) {
    return status ? 3 : 4; // Adjust button style as needed
}