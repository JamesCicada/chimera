const {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    EmbedBuilder,
    ChannelType,
    PermissionFlagsBits,
    Status,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");
const guildDb = require('../../../schemas/guild');
const axios = require('axios')
require('dotenv').config()
module.exports = {
    category: 'utility',
    usage: "setup",
    owner: true,
    structure: new SlashCommandBuilder()
        .setName("setup")
        .setDescription("setup the guild's settings").setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand((command) => command
            .setName('welcoming').setDescription('setup the welcome message whenever someone joins the server')
            .addBooleanOption((option) => option
                .setName('welcome-status')
                .setDescription('switch welcome to on or off')
                .setRequired(true))
            .addChannelOption((option) => option
                .setName('welcome-channel')
                .setDescription('channel to send the welcome message').addChannelTypes(ChannelType.GuildText).addChannelTypes(ChannelType.GuildForum).addChannelTypes(ChannelType.GuildAnnouncement)
                .setRequired(true))
            .addStringOption((option) => option
                .setName('welcome-message')
                .setDescription('The Message to be sent in welcome')
                .setMaxLength(500).setMinLength(2)
                .setRequired(true))
            .addAttachmentOption((option) => option
                .setName('welcome-image')
                .setDescription('image to be included in welcome message')
                .setRequired(true))

        ).addSubcommand((command) => command
            .setName('leaving').setDescription('setup the leaving message whenever someone leaves the server')
            .addBooleanOption((option) => option
                .setName('bye-status')
                .setDescription('switch leave message on or off')
                .setRequired(true))
            .addChannelOption((option) => option
                .setName('bye-channel')
                .setDescription('channel to send the leaving message').addChannelTypes(ChannelType.GuildText).addChannelTypes(ChannelType.GuildForum).addChannelTypes(ChannelType.GuildAnnouncement)
                .setRequired(true)).addStringOption((option) => option
                    .setName('bye-message')
                    .setDescription('The Message to be sent in leaving')
                    .setMaxLength(500).setMinLength(2)
                    .setRequired(true))
            .addAttachmentOption((option) => option
                .setName('bye-image')
                .setDescription('image to be included in leaving message').setRequired(true))
        ).addSubcommand((command) => command
            .setName('verify').setDescription('setup a verification method you can always turn it off later')
            .addBooleanOption((option) => option
                .setName('verify-status')
                .setDescription('switch verification on or off')
                .setRequired(true))
            .addChannelOption((option) => option
                .setName('verify-channel')
                .setDescription('channel to send the verification message').addChannelTypes(ChannelType.GuildText).addChannelTypes(ChannelType.GuildForum).addChannelTypes(ChannelType.GuildAnnouncement)
                .setRequired(true)).addRoleOption((option) => option
                    .setName('verify-role')
                    .setDescription('the role to be given to verified members')
                    .setRequired(true)
                ).addIntegerOption((option) => option
                    .setName('verify-age')
                    .setDescription('minimum age of account to be autoverified (in months) set to 0 to autoverify all joiners').setMaxValue(36)
                    .setRequired(true)

                )
        ).addSubcommand((command) => command
            .setName('moderation').setDescription('setup the moderation roles (muted role, staff role, mods role)')
            .addRoleOption((option) => option
                .setName('muted-role')
                .setDescription('muted role this role won\'t be able to perform any action').setRequired(true)
            ).addRoleOption((option) => option
                .setName('mod-role')
                .setDescription('moderators role mods > staffs').setRequired(true)
            ).addRoleOption((option) => option
                .setName('staff-role')
                .setDescription('staffs role mods > staffs').setRequired(true)
            )
        ).addSubcommand((command) => command
            .setName('logs').setDescription('a logs for Chimera interactions (not all server logs)')
            .addBooleanOption((option) => option
                .setName('logs-status')
                .setDescription('switch logging on or off')
                .setRequired(true))
            .addChannelOption((option) => option
                .setName('logs-channel')
                .setDescription('channel to send the logs').addChannelTypes(ChannelType.GuildText).addChannelTypes(ChannelType.GuildForum).addChannelTypes(ChannelType.GuildAnnouncement)
                .setRequired(true))
        ).addSubcommand((command) => command
            .setName('check').setDescription("check guild's settings")
        ).addSubcommand((command) => command
            .setName('help').setDescription('help list for setup command')
        ).addSubcommand((command) => command
            .setName('boost')
            .setDescription('setup the boost message whenever someone boosts the server')
            .addBooleanOption((option) => option
                .setName('boost-status')
                .setDescription('switch boost alerts to on or off')
                .setRequired(true))
            .addChannelOption((option) => option
                .setName('boost-channel')
                .setDescription('channel to send the boost message').addChannelTypes(ChannelType.GuildText).addChannelTypes(ChannelType.GuildForum).addChannelTypes(ChannelType.GuildAnnouncement)
                .setRequired(true))
            .addAttachmentOption((option) => option
                .setName('boost-image')
                .setDescription('image to be included in boost message')
                .setRequired(true))
        ).addSubcommand((command) => command
            .setName('botswl')
            .setDescription('if bot isn\'t whitelisted it will be kicked (current bots will be automatically whitelisted)')
            .addBooleanOption((option) => option
                .setName('botswl-status')
                .setDescription('switch bots whitelist on or off')
                .setRequired(true))
        ).addSubcommand((command) => command
            .setName('prefix')
            .setDescription('Turn on/off the prefix commands')
            .addBooleanOption((option) => option
                .setName('prefix-status')
                .setDescription('switch bots prefix commands on or off')
                .setRequired(true))
            .addStringOption((option) => option
                .setName('prefix-symbol')
                .setDescription('The Prefix you wanna use ex: ! or m?')
                .setMaxLength(3)
                .setMinLength(1)
                .setRequired(true))
        ).addSubcommand((command) => command
            .setName('autorole')
            .setDescription('Turn on/off the autorole')
            .addBooleanOption((option) => option
                .setName('autorole-status')
                .setDescription('turn autorole on or off')
                .setRequired(true))
            .addRoleOption((option) => option
                .setName('autorole-role1')
                .setDescription('The Role to be Given (for both if role 2 not provided otherwise for humans)')
                .setRequired(true)
            )
            .addStringOption((option) => option
                .setName('autorole-type')
                .setDescription('Bots, Humans, Both / Default: (Both) ')
                .addChoices({
                    name: 'Humans',
                    value: 'humans'
                }, {
                    name: 'Bots',
                    value: 'bots'
                }, {
                    name: 'Both',
                    value: 'both'
                },
                )
            )
            .addRoleOption((option) => option
                .setName('autorole-role2')
                .setDescription('The Role to be Given for bots (use Only if both)')
            ).addBooleanOption((option) => option
                .setName('current-members')
                .setDescription('True = Give To Current Members / False = Give To New Joiners Only')
            )
        ),



    /**
     *
     * @param {ChatInputCommandInteraction} interaction
     */
    run: async (client, interaction) => {
        try {
            async function uploadImage(imageData, name) {
                try {
                    const response = await axios.post('https://api.imgbb.com/1/upload', null, {
                        params: {
                            key: process.env.IMAGEAPI,
                            image: imageData,
                            name: `${name || 'unknown'}-${interaction.guildId}`
                        },

                    });
                    const imageUrl = await response.data.data.url;
                    return imageUrl;
                } catch (error) {
                    console.error('Error uploading image:', error);
                }
            }
            let onEmoji = '<:chimera_switchon:1189609942567616512>'
            let offEmoji = '<:chimera_switchoff:1189610234587664534>'
            let inter = interaction.options
            let guildData = await guildDb.findOne({
                guildId: interaction.guild.id
            })
            if (!guildData) {
                await guildDb.create({
                    guildId: interaction.guild.id
                })
            }
            guildData = await guildDb.findOne({
                guildId: interaction.guild.id
            })
            var embedTemp = new EmbedBuilder().setColor('DarkButNotBlack').setThumbnail(client.user.displayAvatarURL())
            switch (inter.getSubcommand()) {
                case 'welcoming':
                    interaction.channel.sendTyping()
                    let welcomeStatus = interaction.options.getBoolean('welcome-status')
                    let welcomeChannel = interaction.options.getChannel('welcome-channel')
                    let welcomeMessage = interaction.options.getString('welcome-message')
                    let welcomeImage = interaction.options.getAttachment('welcome-image')
                    let imageUrl = await uploadImage(welcomeImage.url, 'welcome')
                    await guildData.updateOne({
                        welcomeStatus: welcomeStatus,
                        welcomeMessage: welcomeMessage,
                        welcomeImages: imageUrl,
                        welcomeChannel: welcomeChannel.id,
                    })
                    guildData = await guildDb.findOne({
                        guildId: interaction.guild.id
                    })
                    await interaction.reply({
                        embeds: [
                            embedTemp.setAuthor({
                                name: `Settings were updated for ${interaction.guild.name}`,
                                iconURL: interaction.guild.iconURL() || client.user.displayAvatarURL()
                            })
                                .setDescription(
                                    `
                                **New Settings Are**

                                > Welcome Status: ${welcomeStatus ? `**on** ${onEmoji}` : `**off** ${offEmoji}`}

                                > Welcome Message: ${welcomeMessage || 'none'}

                                > Welcome Channel: ${welcomeChannel || 'none'}

                                > Welcome Image : Down if you setup any
                                `
                                ).setImage(
                                    welcomeImage.url || interaction.guild.iconURL() || client.user.displayAvatarURL()
                                )
                        ]
                    })
                    break;
                case 'leaving':
                    interaction.channel.sendTyping()
                    let byeStatus = interaction.options.getBoolean('bye-status')
                    let byeChannel = interaction.options.getChannel('bye-channel')
                    let byeMessage = interaction.options.getString('bye-message')
                    let byeImage = interaction.options.getAttachment('bye-image')
                    let leavImageUrl = await uploadImage(byeImage.url, 'bye')
                    await guildData.updateOne({
                        byeStatus: byeStatus,
                        byeMessage: byeMessage,
                        byeImages: leavImageUrl,
                        byeChannel: byeChannel.id,
                    })
                    guildData = await guildDb.findOne({
                        guildId: interaction.guild.id
                    })
                    await interaction.reply({
                        embeds: [
                            embedTemp.setAuthor({
                                name: `Settings were updated for ${interaction.guild.name}`,
                                iconURL: interaction.guild.iconURL() || client.user.displayAvatarURL()
                            })
                                .setDescription(
                                    `
                                    **New Settings Are**

                                    > bye Status: ${byeStatus ? `**on** ${onEmoji}` : `**off** ${offEmoji}`}
    
                                    > bye Message: ${byeMessage || 'none'}
    
                                    > bye Channel: ${byeChannel || 'none'}
    
                                    > bye Image : Down if you setup any
                                    `
                                ).setImage(
                                    byeImage.url || interaction.guild.iconURL() || client.user.displayAvatarURL()
                                )
                        ]
                    })
                    break;
                case 'verify':
                    interaction.channel.sendTyping()
                    let verifyStatus = interaction.options.getBoolean('verify-status')
                    let verifyChannel = interaction.options.getChannel('verify-channel')
                    let verifyRole = interaction.options.getRole('verify-role')
                    let verifyReq = interaction.options.getInteger('verify-age')
                    let verifyMessage = interaction.options.getString('verify-message')
                    //let description = rules ? `${rules}` : ''
                    await guildData.updateOne({
                        verificationStatus: verifyStatus,
                        verificationChannel: verifyChannel,
                        verificationReq: verifyReq,
                        verifiedRole: verifyRole.id,
                    })
                    guildData = await guildDb.findOne({
                        guildId: interaction.guild.id
                    })
                    if (guildData.MutedRole == verifyRole.id) return interaction.reply({
                        content: `you've made a mistake the verified role can't be the same as muted role`,
                        ephemeral: true
                    })
                    let button = new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setLabel('verify!').setCustomId('verifyButton').setStyle(3).setEmoji('<a:verify_icon:1082876486039642192>')
                    )
                    await verifyChannel.send({
                        embeds: [
                            embedTemp.setAuthor({
                                name: `Verify Yourself`,
                                iconURL: `${client.user.displayAvatarURL()}`
                            })
                                .setThumbnail(`https://cdn.discordapp.com/attachments/1043080793754452014/1082795272133943316/SophiaDaPixaum_a_checkmark_inside_a_green_circle_logo_with_dark_f5772aab-e05b-40a0-b889-48bcb678b8fa-removebg-preview.png`)
                                .setDescription(`
                                > **Click on the Button bellow to start the verification challenge**

                                *Don't worry it should be easy as long as you're not a bot*`)
                        ],
                        components: [
                            button
                        ]
                    }).then(async (msg) => {
                        await guildData.updateOne({
                            verificationMessage: msg.id,
                        })
                    })
                    await interaction.reply({
                        embeds: [
                            embedTemp.setAuthor({
                                name: `Settings were updated for ${interaction.guild.name}`,
                                iconURL: interaction.guild.iconURL() || client.user.displayAvatarURL()
                            })
                                .setDescription(
                                    `
                                    **New Settings Are**

                                    > Verification Status: ${verifyStatus ? `**on** ${onEmoji}` : `**off** ${offEmoji}`}
    
                                    > Verification Channel: ${verifyChannel || 'none'}
    
                                    > Verification Req: ${verifyReq || 'none'}
    
                                    > Verification Role : ${verifyRole || 'none'}
                                    `
                                ).setImage(
                                    interaction.guild.iconURL()
                                )
                        ]
                    })
                    break;
                case 'logs':
                    interaction.channel.sendTyping()
                    let logsStatus = interaction.options.getBoolean('logs-status')
                    let logsChannel = interaction.options.getChannel('logs-channel')
                    let webhook = logsChannel.createWebhook({
                        name: 'ChimeraLogs',
                        avatar: `${client.user.displayAvatarURL() || interaction.guild.iconURL()}`,
                        reason: `Logs System Activated By ${interaction.user.tag}`
                    }).then(async (whook) => {
                        await guildData.updateOne({
                            logsStatus: logsStatus,
                            logsChannel: whook.url,
                        })
                    }).catch((err) => {
                        console.log(err);
                        interaction.reply('**Make Sure That i have Permission To Create Webhooks**')
                    })

                    guildData = await guildDb.findOne({
                        guildId: interaction.guild.id
                    })
                    await interaction.reply({
                        embeds: [
                            embedTemp.setAuthor({
                                name: `Settings were updated for ${interaction.guild.name}`,
                                iconURL: interaction.guild.iconURL() || client.user.displayAvatarURL()
                            })
                                .setDescription(
                                    `
                                **New Settings Are**

                                > Logs Status: ${logsStatus ? `**on** ${onEmoji}` : `**off** ${offEmoji}`}

                                > Logs Channel: ${logsChannel || 'none'}
                                `
                                )
                        ]
                    })
                    break;
                case 'moderation':
                    interaction.channel.sendTyping()
                    let mutedRole = interaction.options.getRole('muted-role')
                    let staffRole = interaction.options.getRole('staff-role')
                    let modsRole = interaction.options.getRole('mod-role')
                    if (staffRole == mutedRole || modsRole == mutedRole && staffRole != undefined && modsRole != undefined) return interaction.reply({
                        content: `you've made a mistake the staffs/mods role can't be the same as muted role`,
                        ephemeral: true
                    })

                    await guildData.updateOne({
                        MutedRole: mutedRole,
                        ModsRoles: modsRole,
                        staffsRoles: staffRole,
                    })
                    guildData = await guildDb.findOne({
                        guildId: interaction.guild.id
                    })
                    if (guildData.verifiedRole == mutedRole && mutedRole != undefined) return interaction.reply({
                        content: `you've made a mistake the muted role can't be the same as verified role`,
                        ephemeral: true
                    })
                    if (guildData.staffsRoles == mutedRole && mutedRole != undefined) return interaction.reply({
                        content: `you've made a mistake the muted role can't be the same as verified role`,
                        ephemeral: true
                    })
                    await interaction.reply({
                        embeds: [
                            embedTemp.setAuthor({
                                name: `Settings were updated for ${interaction.guild.name}`,
                                iconURL: interaction.guild.iconURL() || client.user.displayAvatarURL()
                            })
                                .setDescription(
                                    `
                                **New Settings Are**

                                > Muted Role: ${mutedRole || 'none'}

                                > Mods Role: ${modsRole || 'none'}

                                > staffs Role: ${staffRole || 'none'}
                                `
                                )
                        ]
                    })
                    break;
                case 'check':
                    interaction.channel.sendTyping()
                    guildData = await guildDb.findOne({
                        guildId: interaction.guild.id
                    })
                    let welcomeStatusCheck = guildData.welcomeStatus
                    let welcomeChannelCheck = guildData.welcomeChannel
                    let welcomeMessageCheck = guildData.welcomeMessage
                    let welcomeImageCheck = guildData.welcomeImages
                    let byeStatusCheck = guildData.byeStatus
                    let byeChannelCheck = guildData.byeChannel
                    let byeMessageCheck = guildData.byeMessage
                    let byeImageCheck = guildData.byeImages
                    let verifyStatusCheck = guildData.verificationStatus
                    let verifyChannelCheck = guildData.verificationChannel
                    let verifyRoleCheck = guildData.verifiedRole
                    let verifyReqCheck = guildData.verificationReq
                    let logsStatusCheck = guildData.logsStatus
                    let logsChannelCheck = guildData.logsChannel
                    let mutedRoleCheck = guildData.MutedRole
                    let staffRoleCheck = guildData.staffsRoles
                    let modsRoleCheck = guildData.ModsRoles
                    let prefixCheck = guildData.prefixStatus
                    await interaction.reply({
                        embeds: [
                            embedTemp.setAuthor({
                                name: `Settings Check for ${interaction.guild.name}`,
                                iconURL: interaction.guild.iconURL() || client.user.displayAvatarURL()
                            })
                                .setDescription(
                                    `
                                **Crrent Settings Are**

                                > **Welcome Status**: ${welcomeStatusCheck ? `**on** ${onEmoji}` : `**off** ${offEmoji}`}

                                > **Welcome Message**: ${welcomeMessageCheck || 'you might consider setting this up!'}

                                > **Welcome Channel**: ${interaction.guild.channels.cache.get(welcomeChannelCheck) || 'you might consider setting this up!'}

                                > **Welcome Image**: ${welcomeImageCheck ? `[Link](${welcomeImageCheck})` : 'you might consider setting this up!'}

                                > **bye Status**: ${byeStatusCheck ? `**on** ${onEmoji}` : `**off** ${offEmoji}`}
    
                                > **bye Message**: ${byeMessageCheck || 'you might consider setting this up!'}

                                > **bye Channel**: ${interaction.guild.channels.cache.get(byeChannelCheck) || 'you might consider setting this up!'}

                                > **bye Image**: ${byeImageCheck ? `[Link](${byeImageCheck})` : 'you might consider setting this up!'}

                                > **Verification Status**: ${verifyStatusCheck ? `**on** ${onEmoji}` : `**off** ${offEmoji}`}
    
                                > **Verification Channel**: ${interaction.guild.channels.cache.get(verifyChannelCheck) || 'you might consider setting this up!'}

                                > **Verification Req**: ${verifyReqCheck || 'you might consider setting this up!'}

                                > **Verification Role**: ${interaction.guild.roles.cache.get(verifyRoleCheck) || 'you might consider setting this up!'}

                                > **Logs Status**: ${logsStatusCheck ? `**on** ${onEmoji}` : `**off** ${offEmoji}`}

                                > **Logs Channel**: ${interaction.guild.channels.cache.get(logsChannelCheck) || 'you might consider setting this up!'}

                                > **Muted Role**: ${interaction.guild.roles.cache.get(mutedRoleCheck) || 'you might consider setting this up!'}

                                > **Mods Role**: ${interaction.guild.roles.cache.get(modsRoleCheck) || 'you might consider setting this up!'}

                                > **staffs Role**: ${interaction.guild.roles.cache.get(staffRoleCheck) || 'you might consider setting this up!'}
                                `
                                ).setImage(
                                    `${interaction.guild.iconURL() || client.user.displayAvatarURL()}`
                                )
                        ]
                    })
                    break;
                case 'help': {
                    let commandsHelp = []
                    let formattedHelp = []
                    let command = client.commands.find(command => command.data.name == 'setup')
                    console.log(command);
                    let subCommands = command.data.options
                    subCommands.forEach(command => {
                        commandsHelp.push({
                            name: `${command.name}`,
                            value: `${command.description}`
                        })

                    });
                    commandsHelp.forEach(help => {
                        formattedHelp.push(`> <:chimera_arrowwhite:1189611797880250420> **${help.name}** : *${help.value}*\n`)
                    });
                    let embed = new EmbedBuilder().setTitle(`Help List for General Commands`).setDescription(`
                        ${formattedHelp.join('\n')}

                        > if you want to toggle these settings on/off later please use \`/features\`
                        `).setFooter({
                        text: 'to get more details about a command and how to use it run `/command help`'
                    }).setImage('https://media.discordapp.net/attachments/1083081647202762792/1083208588341821510/Empty1.png')
                    await interaction.reply({
                        embeds: [
                            embed.setThumbnail(client.user.displayAvatarURL())
                        ]
                    })
                }
                    break;
                case 'boost':
                    interaction.channel.sendTyping()
                    let boostStatus = interaction.options.getBoolean('boost-status')
                    let boostChannel = interaction.options.getChannel('boost-channel')
                    let boostImage = interaction.options.getAttachment('boost-image')
                    await guildData.updateOne({
                        boostStatus: boostStatus,
                        boostImages: boostImage.url,
                        boostChannel: boostChannel.id,
                    })
                    guildData = await guildDb.findOne({
                        guildId: interaction.guild.id
                    })
                    await interaction.reply({
                        embeds: [
                            embedTemp.setAuthor({
                                name: `Settings were updated for ${interaction.guild.name}`,
                                iconURL: interaction.guild.iconURL() || client.user.displayAvatarURL()
                            })
                                .setDescription(
                                    `
                                **New Settings Are**

                                > Boost Alerts Status: ${boostStatus ? `**on** ${onEmoji}` : `**off** ${offEmoji}`}

                                > Boost Alerts Channel: ${boostChannel || 'none'}

                                > Boost Alerts Image : Down if you setup any
                                `
                                ).setImage(
                                    boostImage.url || interaction.guild.iconURL() || client.user.displayAvatarURL()
                                )
                        ]
                    })
                    break;
                case 'botswl': {
                    let botswlStatus = interaction.options.getBoolean('botswl-status')
                    await guildData.updateOne({
                        botsWlStatus: botswlStatus,
                    })
                    guildData = await guildDb.findOne({
                        guildId: interaction.guild.id
                    })
                    let bots = interaction.guild.members.cache.map(member => member.user.bot)
                    bots.forEach(async bot => {
                        guildData = await guildDb.findOne({
                            guildId: interaction.guild.id
                        })
                        guildData.updateOne({
                            $addToSet: {
                                botWl: bot.id
                            }
                        })
                    })
                    await interaction.reply({
                        embeds: [
                            embedTemp.setAuthor({
                                name: `Settings were updated for ${interaction.guild.name}`,
                                iconURL: interaction.guild.iconURL() || client.user.displayAvatarURL()
                            })
                                .setDescription(
                                    `
                                **New Settings Are**

                                > Bots Whitelist Status: ${botswlStatus ? `**on** ${onEmoji}` : `**off** ${offEmoji}`}

                                `
                                )
                        ]
                    })
                }
                    break;
                case 'audit-logs':
                    interaction.channel.sendTyping()
                    let auditLogsStatus = interaction.options.getBoolean('auditlogs-status')
                    let auditLogsChannel = interaction.options.getChannel('auditlogs-channel')
                    await guildData.updateOne({
                        auditLogsStatus: auditLogsStatus,
                        auditLogsChannel: auditLogsChannel,
                    })
                    guildData = await guildDb.findOne({
                        guildId: interaction.guild.id
                    })
                    await interaction.reply({
                        embeds: [
                            embedTemp.setAuthor({
                                name: `Settings were updated for ${interaction.guild.name}`,
                                iconURL: interaction.guild.iconURL() || client.user.displayAvatarURL()
                            })
                                .setDescription(
                                    `
                                **New Settings Are**

                                > Audit Logs Status: ${auditLogsStatus ? `**on** ${onEmoji}` : `**off** ${offEmoji}`}

                                > Audit Logs Channel: ${auditLogsChannel || 'none'}
                                `
                                )
                        ]
                    })
                    break;
                case 'prefix': {
                    interaction.channel.sendTyping()
                    let prefixStatus = interaction.options.getBoolean('prefix-status')
                    let prefixSymbol = interaction.options.getString('prefix-symbol')
                    await guildData.updateOne({
                        prefixStatus: prefixStatus,
                        prefix: prefixSymbol,
                    })
                    guildData = await guildDb.findOne({
                        guildId: interaction.guild.id
                    })
                    await interaction.reply({
                        embeds: [
                            embedTemp.setAuthor({
                                name: `Settings were updated for ${interaction.guild.name}`,
                                iconURL: interaction.guild.iconURL() || client.user.displayAvatarURL()
                            })
                                .setDescription(
                                    `
                                **New Settings Are**

                                > Prefix Commands Status: ${prefixStatus ? `**on** ${onEmoji}` : `**off** ${offEmoji}`}

                                > Prefix Commands Symbol: ${prefixSymbol || 'none'}
                                `
                                )
                        ]
                    })
                }
                    break;
                case 'autorole': {
                    interaction.channel.sendTyping()
                    let autoroleStatus = interaction.options.getBoolean('autorole-status')
                    let autoroleType = interaction.options.getString('autorole-type')
                    let role = interaction.options.getRole('autorole-role1')
                    let currentMems = interaction.options.getBoolean('current-members')
                    let role2
                    if (autoroleType == 'bots' || autoroleType == 'both') {
                        role2 = interaction.options.getRole('autorole-role2') || role
                    }

                    if (autoroleType == 'bots') {
                        await guildData.updateOne({
                            autoRoleStatus: autoroleStatus,
                            autoRoleType: autoroleType,
                            autoRoleBots: true,
                            autoRoleHumans: false,
                            autoRoleBotsRole: role.id,
                        })
                    }
                    if (autoroleType == 'humans') {
                        await guildData.updateOne({
                            autoRoleStatus: autoroleStatus,
                            autoRoleType: autoroleType,
                            autoRoleBots: false,
                            autoRoleHumans: true,
                            autoRoleHumansRole: role.id,
                        })
                    }
                    if (autoroleType == 'both') {
                        await guildData.updateOne({
                            autoRoleStatus: autoroleStatus,
                            autoRoleType: autoroleType,
                            autoRoleBots: true,
                            autoRoleHumans: true,
                            autoRoleBotsRole: role2.id,
                            autoRoleHumansRole: role.id,
                        })
                    }
                    guildData = await guildDb.findOne({
                        guildId: interaction.guild.id
                    })
                    await interaction.reply({
                        embeds: [
                            embedTemp.setAuthor({
                                name: `Settings were updated for ${interaction.guild.name}`,
                                iconURL: interaction.guild.iconURL() || client.user.displayAvatarURL()
                            })
                                .setDescription(
                                    `
                                    **New Settings Are**
    
                                    > AutoRole Status: ${autoroleStatus ? `**on** ${onEmoji}` : `**off** ${offEmoji}`}
    
                                    > AutoRole Type: ${autoroleType || 'none'}

                                    > AutoRole Humans: ${role || guildData.autoRoleHumansRole || 'none'}

                                    > AutoRole Bots: ${role2 || `<@${guildData.autoRoleBotsRole}>` || 'none'}
                                    `
                                )
                        ]
                    })
                    if (currentMems && currentMems == true) {
                        if (autoroleType == 'bots') {
                            let members = await interaction.guild.members.fetch()
                            let k = 0
                            members.forEach(async (bot) => {
                                let givenRole = role2 || role
                                if (!bot.user.bot) return
                                //console.log(bot);
                                await bot.roles.add(givenRole, [`AutoRole used by ${interaction.user.tag}`])
                                k++
                                if (k >= 20) {
                                    k = 0
                                    sleep(500)
                                }
                            });
                            await interaction.editReply({
                                components: [
                                    new ActionRowBuilder().addComponents(
                                        new ButtonBuilder().setLabel('Done adding Role to bots').setStyle(ButtonStyle.Success).setCustomId('botsAutoRole').setDisabled(true)
                                    )
                                ]
                            })
                        }
                        if (autoroleType == 'humans') {

                            let j = 0
                            let members = await interaction.guild.members.fetch()
                            members.forEach(async (human) => {
                                if (human.user.bot) return
                                //console.log(human);
                                await human.roles.add(role, [`AutoRole used by ${interaction.user.tag}`])
                                j++
                                if (j >= 20) {
                                    j = 0
                                    sleep(500)
                                }
                            });
                            await interaction.editReply({
                                components: [
                                    new ActionRowBuilder().addComponents(
                                        new ButtonBuilder().setLabel('Done adding Role to humans').setStyle(ButtonStyle.Success).setCustomId('botsAutoRole').setDisabled(true)
                                    )
                                ]
                            })
                        }
                        if (autoroleType == 'both') {
                            let members = await interaction.guild.members.fetch()
                            //console.log(members.size);
                            let j = 0
                            members.forEach(async (human) => {
                                if (human.user.bot) return
                                //console.log(human);
                                await human.roles.add(role, [`AutoRole used by ${interaction.user.tag}`])
                                j++
                                if (j >= 20) {
                                    j = 0
                                    sleep(500)
                                }
                            });
                            // for (let i = 0; i < members.size; i++) {


                            // }
                            let k = 0
                            members.forEach(async (bot) => {
                                let givenRole = role2 || role
                                if (!bot.user.bot) return
                                //console.log(bot);
                                await bot.roles.add(givenRole, [`AutoRole used by ${interaction.user.tag}`])
                                k++
                                if (k >= 20) {
                                    k = 0
                                    sleep(500)
                                }
                            });
                            // for (let i = 0; i < members.size; i++) {
                            //const bot = members.at(i);


                            // }
                            await interaction.editReply({
                                components: [
                                    new ActionRowBuilder().addComponents(
                                        new ButtonBuilder().setLabel('Done adding Role to humans and bots').setStyle(ButtonStyle.Success).setCustomId('botsAutoRole').setDisabled(true)
                                    )
                                ]
                            })
                        }
                    }
                }
                    break;
            }
        } catch (error) {
            console.log(error);
            // interaction.reply({
            //     content: `There was an error please check my permissions`,
            //     ephemeral: true,
            // });
        }
    },
};
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}