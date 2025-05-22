const { SlashCommandBuilder } = require("@discordjs/builders");
const { Client, ActionRowBuilder, ButtonBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const guildDb = require('../../../schemas/guild');

module.exports = {
    category: 'moderation',
    usage: "features",
    admin: true,
    structure: new SlashCommandBuilder()
        .setName("features")
        .setDescription("Check features and turn them on/off")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    run: async (client, interaction) => {
        try {
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
            interaction.followUp({
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