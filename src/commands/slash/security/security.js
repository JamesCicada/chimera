const {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
    AutoModerationRule,
} = require("discord.js");
const secDb = require('../../../schemas/security')

module.exports = {
    category: 'protection',
    usage: "security [anti-spam/anti-link/anti-mention]",
    structure: new SlashCommandBuilder()
        .setName("security")
        .setDescription("Control Security Features")
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addSubcommand((command) =>
            command
                .setName("anti-spam")
                .setDescription("Control The Anti Spam Feature")
                .addBooleanOption((option) =>
                    option
                        .setName("anti-spam-status")
                        .setDescription("True = ON / False = OFF")
                        .setRequired(true)
                )
                .addIntegerOption((option) =>
                    option
                        .setName("anti-spam-cooldown")
                        .setDescription(
                            "The Period of The Cooldown in Seconds (Default to 5 sec)"
                        )
                        .setMinValue(5)
                        .setMaxValue(30)
                        .setRequired(true)
                )
                .addIntegerOption((option) =>
                    option
                        .setName("anti-spam-max")
                        .setDescription(
                            "The Maximum Messages To Be sent in The cooldown period (Default to 5 messages)"
                        )
                        .setMinValue(5)
                        .setMaxValue(30)
                        .setRequired(true)
                )
                .addStringOption((option) =>
                    option
                        .setName("anti-spam-punishment-1")
                        .setDescription(
                            "The Punishment of Spamming (warning in dms is always on)"
                        )
                        .addChoices(
                            {
                                name: "Mute",
                                value: "mute",
                            },
                            {
                                name: "DeleteMessage",
                                value: "delete",
                            },
                            {
                                name: "Warn",
                                value: "warn",
                            }
                        )
                        .setRequired(true)
                )
                .addStringOption((option) =>
                    option
                        .setName("anti-spam-punishment-2")
                        .setDescription(
                            "The Punishment of Spamming (warning in dms is always on)"
                        )
                        .addChoices(
                            {
                                name: "Mute",
                                value: "mute",
                            },
                            {
                                name: "DeleteMessage",
                                value: "delete",
                            },
                            {
                                name: "Warn",
                                value: "warn",
                            }
                        )
                )
                .addStringOption((option) =>
                    option
                        .setName("anti-spam-punishment-3")
                        .setDescription(
                            "The Punishment of Spamming (warning in dms is always on)"
                        )
                        .addChoices(
                            {
                                name: "Mute",
                                value: "mute",
                            },
                            {
                                name: "DeleteMessage",
                                value: "delete",
                            },
                            {
                                name: "Warn",
                                value: "warn",
                            }
                        )
                )
        )
        .addSubcommand((command) => command
            .setName('anti-links')
            .setDescription('prevents members from sending links (invite/external)')
            .addBooleanOption((option) => option
                .setName('anti-links-status')
                .setDescription("True = ON / False = OFF")
                .setRequired(true)
            )
            .addStringOption((option) => option
                .setName('anti-links-type')
                .setDescription('external = non-discord links, invites = discord invites')
                .addChoices(
                    {
                        name: 'Invites',
                        value: 'invites'
                    },
                    {
                        name: 'External',
                        value: 'external'
                    },
                    {
                        name: 'Both',
                        value: 'both'
                    },)
                .setRequired(true)
            )
            .addStringOption((option) =>
                option
                    .setName("anti-links-punishment-1")
                    .setDescription(
                        "The Punishment of Spamming (warning in dms is always on)"
                    )
                    .addChoices(
                        {
                            name: "Mute",
                            value: "mute",
                        },
                        {
                            name: "DeleteMessage",
                            value: "delete",
                        },
                        {
                            name: "Warn",
                            value: "warn",
                        },
                        {
                            name: 'Kick',
                            value: 'kick'
                        },
                        {
                            name: 'Ban',
                            value: 'ban'
                        }
                    )
                    .setRequired(true)
            )
            .addStringOption((option) =>
                option
                    .setName("anti-links-punishment-2")
                    .setDescription(
                        "The Punishment of Spamming (warning in dms is always on)"
                    )
                    .addChoices(
                        {
                            name: "Mute",
                            value: "mute",
                        },
                        {
                            name: "DeleteMessage",
                            value: "delete",
                        },
                        {
                            name: "Warn",
                            value: "warn",
                        },
                        {
                            name: 'Kick',
                            value: 'kick'
                        },
                        {
                            name: 'Ban',
                            value: 'ban'
                        }
                    )
            )
            .addStringOption((option) =>
                option
                    .setName("anti-links-punishment-3")
                    .setDescription(
                        "The Punishment of Spamming (warning in dms is always on)"
                    )
                    .addChoices(
                        {
                            name: "Mute",
                            value: "mute",
                        },
                        {
                            name: "DeleteMessage",
                            value: "delete",
                        },
                        {
                            name: "Warn",
                            value: "warn",
                        },
                        {
                            name: 'Kick',
                            value: 'kick'
                        },
                        {
                            name: 'Ban',
                            value: 'ban'
                        }
                    )
            ).addStringOption((option) =>
                option
                    .setName("anti-links-punishment-4")
                    .setDescription(
                        "The Punishment of Spamming (warning in dms is always on)"
                    )
                    .addChoices(
                        {
                            name: "Mute",
                            value: "mute",
                        },
                        {
                            name: "DeleteMessage",
                            value: "delete",
                        },
                        {
                            name: "Warn",
                            value: "warn",
                        },
                        {
                            name: 'Kick',
                            value: 'kick'
                        },
                        {
                            name: 'Ban',
                            value: 'ban'
                        }
                    )
            ).addStringOption((option) =>
                option
                    .setName("anti-links-punishment-5")
                    .setDescription(
                        "The Punishment of Spamming (warning in dms is always on)"
                    )
                    .addChoices(
                        {
                            name: "Mute",
                            value: "mute",
                        },
                        {
                            name: "DeleteMessage",
                            value: "delete",
                        },
                        {
                            name: "Warn",
                            value: "warn",
                        },
                        {
                            name: 'Kick',
                            value: 'kick'
                        },
                        {
                            name: 'Ban',
                            value: 'ban'
                        }
                    )
            )
        )
    ,
    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    run: async (client, interaction) => {
        try {
            let { channel, memmber, options, guild } = interaction
            let subCommands = options.getSubcommand()
            let guildSec = await secDb.findOne({
                guildId: guild.id
            })
            if (!guildSec) {
                await secDb.create({
                    guildId: guild.id
                })
            }
            guildSec = await secDb.findOne({
                guildId: guild.id
            })
            switch (subCommands) {
                case 'anti-spam':
                    let newStatus = options.getBoolean('anti-spam-status')
                    let newCooldown = options.getInteger('anti-spam-cooldown')
                    let newMax = options.getInteger('anti-spam-max')
                    let punishment1 = options.getString('anti-spam-punishment-1')
                    let punishment2 = options.getString('anti-spam-punishment-2') || ''
                    let punishment3 = options.getString('anti-spam-punishment-3') || ''
                    let punishments = [punishment1]
                    if (punishment2 != '') {
                        punishments.push(punishment2)
                    }
                    if (punishment3 != '') {
                        punishments.push(punishment3)
                    }
                    let description = []
                    if (!guildSec.spamStatus || guildSec.spamStatus == undefined) {
                        description.push(`> Old Status: NONE\n`)
                    } else if (guildSec.spamStatus == false) {
                        description.push(`> Old Status: OFF\n`)
                    } else if (guildSec.spamStatus == true) {
                        description.push(`> Old Status: ON\n`)
                    }
                    if (newStatus != guildSec.spamStatus) {
                        description.push(`> New Status: ${newStatus ? 'ON' : 'OFF'} \n`)
                    } else {
                        description.push(`> New Status: No Change (${newStatus ? 'ON' : 'OFF'}) \n`)
                    }
                    description.push(`> New Cooldown: ${newCooldown}\n`)
                    description.push(`> New Treshold: ${newMax}\n`)
                    description.push(`
                    > Punishments:
                    <:chimera_arrowwhite:1189611797880250420> ${punishments.join(`\n<:chimera_arrowwhite:1189611797880250420> `)}`)
                    await guildSec.updateOne({
                        spamStatus: newStatus,
                        spamPeriod: newCooldown,
                        spamMax: newMax,
                    })
                    await guildSec.updateOne({
                        spamPunishment: punishments
                    })
                    let updateEmbed = new EmbedBuilder().setTitle('Updated AntiSpam Settings').setColor('DarkButNotBlack').setDescription(description.join('\n').toString())
                    await interaction.reply({
                        embeds: [updateEmbed]
                    })
                    break;
                case 'anti-links': {
                    let newStatus = options.getBoolean('anti-links-status')
                    let newType = options.getString('anti-links-type')
                    let punishment1 = options.getString('anti-links-punishment-1')
                    let punishment2 = options.getString('anti-links-punishment-2') || ''
                    let punishment3 = options.getString('anti-links-punishment-3') || ''
                    let punishment4 = options.getString('anti-links-punishment-4') || ''
                    let punishment5 = options.getString('anti-links-punishment-5') || ''
                    let punishments = [punishment1]
                    if (punishment2 != '') {
                        if(punishments.includes(punishment2)) return
                        punishments.push(punishment2)
                    }
                    if (punishment3 != '') {
                        if(punishments.includes(punishment3)) return
                        punishments.push(punishment3)
                    }
                    if (punishment4 != '') {
                        if(punishments.includes(punishment4)) return
                        punishments.push(punishment4)
                    }
                    if (punishment5 != '') {
                        if(punishments.includes(punishment5)) return
                        punishments.push(punishment5)
                    }
                    let description = []
                    if (!guildSec.inviteStatus || guildSec.inviteStatus == undefined) {
                        description.push(`> Old Status: NONE\n`)
                    } else if (guildSec.inviteStatus == false) {
                        description.push(`> Old Status: OFF\n`)
                    } else if (guildSec.inviteStatus == true) {
                        description.push(`> Old Status: ON\n`)
                    }
                    if (newStatus != guildSec.inviteStatus) {
                        description.push(`> New Status: ${newStatus ? 'ON' : 'OFF'} \n`)
                    } else {
                        description.push(`> New Status: No Change (${newStatus ? 'ON' : 'OFF'}) \n`)
                    }
                    if (newType != guildSec.inviteType) {
                        description.push(`> New Type: ${newType.toString().toUpperCase()} \n`)
                    } else {
                        description.push(`> New Type: No Change (${newType.toString().toUpperCase()}) \n`)
                    }
                    description.push(`
                    > Punishments:
                    <:chimera_arrowwhite:1189611797880250420> ${punishments.join(`\n<:chimera_arrowwhite:1189611797880250420> `)}`)
                    await guildSec.updateOne({
                        inviteStatus: newStatus,
                        inviteType: newType,
                        invitePunishment: punishments
                    })
                    let updateEmbed = new EmbedBuilder().setTitle('Updated AntiLinks Settings').setColor('DarkButNotBlack').setDescription(description.join('\n').toString())
                    await interaction.reply({
                        embeds: [updateEmbed]
                    })
                }
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
