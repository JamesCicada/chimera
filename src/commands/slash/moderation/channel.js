const { SlashCommandBuilder } = require("@discordjs/builders");
const { Client, ActionRowBuilder, ButtonBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");
const guildDb = require('../../../schemas/guild')
module.exports = {
    category: 'moderation',
    usage: "channel [lock/unlock/hide/unhide]",
    structure: new SlashCommandBuilder()
        .setName("channel")
        .setDescription("manage channel perms")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand((command) => command
            .setName('lock').setDescription('lock / unlock channel')
            .addBooleanOption((option) => option
                .setName('lock-status')
                .setDescription('true = locked, false = unlocked')
                .setRequired(true))
            .addChannelOption((option) => option
                .setName('lock-channel')
                .setDescription('Targeted Channel (leave empty to use the current channel')
                .setRequired(false))
            .addRoleOption((option) => option
                .setName('lock-role')
                .setDescription('Target Role (leave empty to use @everyone)')
                .setRequired(false))
        )
        .addSubcommand((command) => command
            .setName('hide').setDescription('hide / unhide channel')
            .addBooleanOption((option) => option
                .setName('hide-status')
                .setDescription('true = hidden, false = shown')
                .setRequired(true))
            .addChannelOption((option) => option
                .setName('hide-channel')
                .setDescription('Targeted Channel (leave empty to use the current channel')
                .setRequired(false))
            .addRoleOption((option) => option
                .setName('hide-role')
                .setDescription('Target Role (leave empty to use @everyone)')
                .setRequired(false))
        )
        .addSubcommand((command) => command
            .setName('hide-all').setDescription('hide / unhide all channel for a role')
            .addBooleanOption((option) => option
                .setName('hideall-status')
                .setDescription('true = hidden, false = shown')
                .setRequired(true))
            .addRoleOption((option) => option
                .setName('hideall-role')
                .setDescription('Target Role')
                .setRequired(true))
        )
        .addSubcommand((command) => command
            .setName('lock-all').setDescription('lock / unlock all channel for a role')
            .addBooleanOption((option) => option
                .setName('lockall-status')
                .setDescription('true = locked, false = unlocked')
                .setRequired(true))
            .addRoleOption((option) => option
                .setName('lockall-role')
                .setDescription('Target Role')
                .setRequired(true))
        )
    ,
    run: async (client, interaction) => {
        try {
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
            let inter = interaction.options
            switch (inter.getSubcommand()) {
                case 'lock': {
                    let lockStatus = interaction.options.getBoolean('lock-status')
                    let lockTargetChannel = interaction.options.getChannel('lock-channel') || interaction.channel
                    let lockedTargetRole = interaction.options.getRole('lock-role') || interaction.guild.roles.everyone
                    let lockedRoleName = lockedTargetRole == interaction.guild.roles.everyone ? 'everyone' : lockedTargetRole.name
                    if (lockedTargetRole.permissions.has(PermissionFlagsBits.Administrator)) return interaction.reply(`Roles with admin permissions will always be able to see and type in this channel.`)
                    await lockTargetChannel.permissionOverwrites.edit(lockedTargetRole, {
                        SendMessages: lockStatus ? false : null
                    }, [{ reason: `Channel Lock Command by ${interaction.user.tag}` }]).then(() => {
                        interaction.reply(`Channel has been ${lockStatus ? '**locked**' : '**unlocked**'} for role _**${lockedRoleName}**_.`)
                    })
                }
                    break;
                case 'hide': {
                    let hideStatus = interaction.options.getBoolean('hide-status')
                    let hideTargetChannel = interaction.options.getChannel('hide-channel') || interaction.channel
                    let hideTargetRole = interaction.options.getRole('hide-role') || interaction.guild.roles.everyone
                    let hideRoleName = hideTargetRole == interaction.guild.roles.everyone ? 'everyone' : hideTargetRole.name
                    if (hideTargetRole.permissions.has(PermissionFlagsBits.Administrator)) return interaction.reply(`Roles with admin permissions will always be able to see and type in this channel.`)
                    await hideTargetChannel.permissionOverwrites.edit(hideTargetRole, {
                        ViewChannel: hideStatus ? false : null
                    }, [{ reason: `Channel Lock Command by ${interaction.user.tag}` }]).then(() => {
                        interaction.reply(`Channel has been ${hideStatus ? '**hidden**' : '**shown**'} for role _**${hideRoleName}**_.`)
                    })
                }
                    break;
                case 'hide-all': {
                    let hideAllStatus = interaction.options.getBoolean('hideall-status')
                    let hideAllTargetRole = interaction.options.getRole('hideall-role')
                    let hideAllRoleName = hideAllTargetRole.name
                    if (hideAllTargetRole.permissions.has(PermissionFlagsBits.Administrator)) return interaction.reply(`Roles with admin permissions will always be able to see and type in this channel.`)
                    let allChannels = interaction.guild.channels.cache
                    // if (allChannels.size >= 50) return interaction.reply(`Due to ratelimits and discord's tos i can't do that for more than 50 channels maybe in the future when i'm stronger`)
                    allChannels.each(async channel => {
                        if (channel.type == ChannelType.GuildCategory) return
                        await channel.permissionOverwrites.edit(hideAllTargetRole, {
                            ViewChannel: hideAllStatus ? false : null
                        }, [{ reason: `Channel Lock Command by ${interaction.user.tag}` }])
                        await sleep(250)
                    });
                    interaction.reply(`${allChannels.size} Channels has been ${hideAllStatus ? '**hidden**' : '**shown**'} for role _**${hideAllRoleName}**_.`)
                }
                    break;
                case 'lock-all': {
                    let lockAllStatus = interaction.options.getBoolean('lockall-status')
                    let lockAllTargetRole = interaction.options.getRole('lockall-role')
                    let lockAllRoleName = lockAllTargetRole.name
                    if (lockAllTargetRole.permissions.has(PermissionFlagsBits.Administrator)) return interaction.reply(`Roles with admin permissions will always be able to see and type in this channel.`)
                    let allChannels = interaction.guild.channels.cache
                    // if (allChannels.size >= 50) return interaction.reply(`Due to ratelimits and discord's tos i can't do that for more than 50 channels maybe in the future when i'm stronger`)
                    allChannels.each(async channel => {
                        if (channel.type == ChannelType.GuildCategory) return
                        await channel.permissionOverwrites.edit(lockAllTargetRole, {
                            ViewChannel: lockAllStatus ? false : null
                        }, [{ reason: `Channel Lock Command by ${interaction.user.tag}` }])
                        await sleep(250)
                    });
                    interaction.reply(`${allChannels.size} Channels has been ${lockAllStatus ? '**locked**' : '**unlocked**'} for role _**${lockAllRoleName}**_.`)
                }
                    break;
            }
        } catch (err) {
            console.error(err);
            interaction.reply({
                content: `There was an error please check my permissions`,
                ephemeral: true,
            });
        }

    },
};
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
 }