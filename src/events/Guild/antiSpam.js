const { ActivityType, Client, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const mongoose = require('mongoose')
const guildDb = require('../../schemas/guild')
const moment = require('moment')
const security = require('../../schemas/security')
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
                if (!guildSec.spamStatus || guildSec.spamStatus == false) return
                //console.log('yes');
                let cooldowns = client.cooldowns
                const spamCooldown = guildSec.spamPeriod || 5;
                const spamThreshold = guildSec.spamMax || 5;
                let warned = client.warned
                if (message.member.permissions.has(PermissionFlagsBits.Administrator)) return
                if (!cooldowns.has(userId)) {
                    cooldowns.set(userId, {
                        messageCount: 1,
                        lastMessage: message,
                        timer: setTimeout(() => {
                            cooldowns.delete(userId);
                        }, spamCooldown * 1000)
                    });
                } else {
                    const userCooldown = cooldowns.get(userId);
                    userCooldown.messageCount++;

                    if (userCooldown.messageCount > spamThreshold) {
                        if (guildSec.spamPunishment.includes('delete')) {
                            message.delete();
                        }
                        if (guildSec.spamPunishment.includes('warn')) {
                            if (!warned.has(userId)) {
                                await message.member.send({
                                    embeds: [
                                        new EmbedBuilder().setColor('Red').setAuthor({
                                            name: `From ${message.guild.name}`,
                                            iconURL: `${message.guild.iconURL() || client.user.displayAvatarURL()}`
                                        }).setTitle(`Warning For Spam!`).setDescription(`
                                > You Have Been Warned For Spamming Messages
                                `).setFooter({ text: `By AntiSpam System!` })
                                    ]
                                })
                                warned.set(userId, {
                                    reason: 'spam',
                                    timer: setTimeout(() => {
                                        warned.delete(userId);
                                    }, spamCooldown * 1000)
                                });
                            } else {
                                if (guildSec.spamPunishment.includes('mute')) {
                                    let muteRole = guildData.MutedRole
                                    if (!muteRole) {
                                        return
                                    } else {
                                        message.member.roles.add(muteRole, ['Spamming Messages!'])
                                    }

                                }
                            }

                        }



                        clearTimeout(userCooldown.timer);
                        userCooldown.timer = setTimeout(() => {
                            cooldowns.delete(userId);
                        }, spamCooldown * 1000);
                    } else {
                        userCooldown.lastMessage = message;
                    }
                }
            }
        } catch (error) {
            console.log(error);
        }
    },
};
