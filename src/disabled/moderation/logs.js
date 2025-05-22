const {
    interaction,
    Client,
    ModalBuilder,
    ActionRowBuilder,
    TextInputBuilder,
    StringSelectMenuBuilder,
    ButtonBuilder,
    EmbedBuilder,
    WebhookClient
} = require("discord.js");
const fs = require("fs");
const moment = require("moment");
const guildDb = require('../../schemas/guild')
/**
 * @param {interaction} interaction
 * @param {Client} client
 */
module.exports = {
    event: "interactionCreate",
    run: async (client, interaction) => {
        try {
            let guild = interaction.guild
            let guildData = guildDb.findOne({
                guildId: interaction.guild.id
            })
            if (!guildData) {
                await guildDb.create({
                    guildId: guild.id
                }).then(() => {
                    console.log(`added ${guild.id} to database`);
                })
            }
            guildData = await guildDb.findOne({
                guildId: interaction.guild.id
            })
            if (guildData.logsStatus || guildData.logsStatus == true) {
                var embedTemp = new EmbedBuilder().setColor('DarkButNotBlack').setThumbnail(client.user.displayAvatarURL())
                if (interaction.isButton()) {
                    let logsChannel = new WebhookClient({url: guildData.logsChannel})
                    let date = Math.round(Date.now() / 1000)
                    await logsChannel.send({
                        embeds: [
                            embedTemp.setAuthor({
                                name: `${interaction.user.username}`,
                                iconURL: `${interaction.user.displayAvatarURL() || client.user.displayAvatarURL()}`
                            }).setDescription(`
                            Interaction Used: **${interaction.customId || 'unknown'}**
                            Time: <t:${date}:R>
                            Channel: ${interaction.channel || 'unknown'}
                            `)
                        ]
                    })
                } else if (interaction.isChatInputCommand) {
                    let logsChannel = new WebhookClient({url: guildData.logsChannel})
                    let date = Math.round(Date.now() / 1000)
                    await logsChannel.send({
                        embeds: [
                            embedTemp.setAuthor({
                                name: `${interaction.user.username}`,
                                iconURL: `${interaction.user.displayAvatarURL() || client.user.displayAvatarURL()}`
                            }).setDescription(`
                            Command Issued: **${interaction.commandName || 'unknown'}**
                            Time: <t:${date}:R>
                            Channel: ${interaction.channel || 'unknown'}
                            `)
                        ]
                    }).catch((err) => {
                        console.log(err.rawError.message);
                    })
                }
            }

        } catch (err) {
            console.log(err);
        }
    },
};
