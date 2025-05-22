const {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
} = require("discord.js");
const protDb = require('../../../schemas/protection')

module.exports = {
    beta: true,
    owner: true,
    structure: new SlashCommandBuilder()
        .setName("protection")
        .setDescription("Advanced protection (antiraid...)")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand((s) => s
            .setName('setup')
            .setDescription('Setup the protection feature')
            .addBooleanOption((o) => o
                .setName('status')
                .setDescription('Turn Protection ON or OFF')
                .setRequired(true)
            )
            .addChannelOption((o) => o
                .setName('logs-channel')
                .setDescription('where the protection logs get sent')
            )
        ).addSubcommand((s) => s
            .setName('help')
            .setDescription('More informations about the protection')
        ).addSubcommand((s) => s
            .setName('delete')
            .setDescription('Deletes all the protection settings (the logs channel will stay)')
        )
    ,

    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    run: async (client, interaction) => {
        try {
            const subs = interaction.options.getSubcommand()
            let protData = await protDb.findOne({
                guildId: interaction.guildId
            })
            if (!protData) {
                await protDb.create({
                    guildId: interaction.guildId
                })
            }
            protData = await protDb.findOne({
                guildId: interaction.guildId
            })
            switch (subs) {
                case 'setup':
                    const status = interaction.options.getBoolean('status')
                    const channel = interaction.options.getChannel('logs-channel')
                    const embeds = new EmbedBuilder().setColor('DarkButNotBlack')
                    await interaction.reply({
                        embeds: [
                            embeds.setDescription('<a:chimera_loading:1189609175840460961> Loading Setting...')
                        ]
                    }).then(async (msg) => {
                        const webhook = await channel.createWebhook({
                            name: `Chimera Protection Logs`,
                            avatar: client.user.displayAvatarURL(),
                            reason: `Advanced Protection Logs`
                        })
                        await protData.updateOne({
                            $set:{
                                protection:{
                                    status: status,
                                    channel: webhook.url
                                }
                            }
                        })
                        msg.edit({
                            embeds:[
                                embeds.setDescription(`
                                ### Advanced Protection

                                > Status: ${status}

                                > Channel: ${channel}
                                `).setColor('Green')
                            ]
                        })
                    })

                    break;
            }
        } catch (err) {
            interaction.reply({
                content: `There was an error please check my permissions`,
                ephemeral: true,
            });
            console.log(err);
        }
    },
};
