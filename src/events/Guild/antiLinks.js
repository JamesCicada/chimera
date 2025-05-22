const { ActivityType, Client, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const mongoose = require('mongoose')
const guildDb = require('../../schemas/guild')
const moment = require('moment')
const security = require('../../schemas/security');
const guild = require("../../schemas/guild");
module.exports = {
    event: "messageCreate",
    run: async (client, message) => {

        try {
            if (!message.author.bot) {
                const { author, content } = message;
                const userId = author.id;
                let guildSec = await security.findOne({
                    guildId: message.guild.id
                })
                if (!guildSec) {
                    await security.create({
                        guildId: message.guild.id
                    })
                }
                guildSec = await security.findOne({
                    guildId: message.guild.id
                })
                let guildData = await guildDb.findOne({
                    guildId: message.guild.id
                })
                if (!guildData) {
                    await guildDb.create({
                        guildId: message.guild.id
                    })
                }
                guildData = await guildDb.findOne({
                    guildId: message.guild.id
                })
                if (!guildSec.inviteStatus || guildSec.inviteStatus == false) return
                if (message.guild.id != '1189604617869328444') return
                let inviteRegex = ['discord.gg/', 'discord.com/invite/', '.gg/']
                let linkRegex = /((([(https)(http)]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/
                let type = guildSec.inviteType
                let isInvite = message.content.includes(inviteRegex[0]) || message.content.includes(inviteRegex[1])
                let puns = guildSec.invitePunishment
                /*
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
                */
                async function action() {
                    if (puns.includes('mute')) {
                        let muteRole = guildData.MutedRole
                        if (puns.includes('kick') || puns.includes('ban')) return
                        if (!muteRole) {
                            return
                        } else {
                            await message.member.roles.add(muteRole, ['Posting Links!'])
                        }
                    }
                    if (puns.includes('delete')) {
                        message.delete()
                    }
                    if (puns.includes('warn')) {
                        await message.member.send({
                            embeds: [
                                new EmbedBuilder().setColor('Red').setAuthor({
                                    name: `From ${message.guild.name}`,
                                    iconURL: `${message.guild.iconURL() || client.user.displayAvatarURL()}`
                                }).setTitle(`Warning For Links!`).setDescription(`
                        > You Have Been Warned For Sending Links
                        `).setFooter({ text: `By AntiLinks System!` })
                            ]
                        })
                    }
                    if (puns.includes('kick')) {
                        if (puns.includes('ban')) return
                        await message.member.kick(['Posting Links!'])
                    }
                    if (puns.includes('ban')) {
                        await message.member.ban(['Posting Links!'])
                    }
                }
                if (message.member.permissions.has(PermissionFlagsBits.Administrator)) return
                switch (type) {
                    case 'invites':
                        if (isInvite) {
                            action()
                        }
                        break;
                    case 'external':
                        if (linkRegex.test(message.content) && !isInvite) {
                            action()
                        }
                        break;
                    case 'both': {
                        if (linkRegex.test(message.content) || isInvite) {
                            action()
                        }
                    }
                }


            }
        } catch (error) {
            console.log(error);
        }
    },
};
