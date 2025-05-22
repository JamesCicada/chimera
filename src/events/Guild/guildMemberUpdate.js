const { ActivityType, Client, EmbedBuilder, PermissionFlagsBits, GuildMember } = require("discord.js");
const mongoose = require('mongoose')
const guildDb = require('../../schemas/guild')
module.exports = {
    event: "guildMemberUpdate",
    /**
     * 
     * @param {Client} client 
     * @param {GuildMember} oldMember 
     * @param {GuildMember} newMember 
     * @returns 
     */
    run: async (client, oldMember, newMember) => {

        try {
            let guild = oldMember.guild
            let guildData = await guildDb.findOne({
                guildId: guild.id
            })
            if (!guildData) {
                await guildDb.create({
                    guildId: guild.id
                }).then(() => {
                    console.log(`added ${guild.id} to database`);
                })
            }
            guildData = await guildDb.findOne({
                guildId: guild.id
            })
            if (!oldMember.roles.cache.has(guild.premiumSubscriberRole) && newMember.roles.cache.has(guild.premiumSubscriberRole)) {
                if (guildData.boostStatus || guildData.boostStatus == true) {
                    let boostChannel = guild.channels.cache.get(guildData.boostChannel)
                    let boostImage = guildData.boostImages || guild.iconURL()
                    var embedTemp = new EmbedBuilder().setColor('DarkButNotBlack')
                    await boostChannel.send({
                        embeds: [
                            embedTemp.setAuthor({
                                name: ` ${member.user.tag} Just Boosted the server`,
                                iconURL: member.user.displayAvatarURL() || guild.iconURL()
                            }).setImage(
                                `${boostImage || guild.iconURL()}`
                            ).setDescription(`
                            > ${oldMember} Thank you!

                            - We are now at:

                            > <:chimera_booster:1189612872578383952>  Boosts: ${oldMember.guild.premiumSubscriptionCount}

                            > <:chimera_nitro:1189612876147732581>  Tier: ${oldMember.guild.premiumTier}
                            `)
                                .setThumbnail(`${member.user.displayAvatarURL() || guild.iconURL()}`)
                        ]
                    })
                }
            }
            if (guildData.botsWlStatus || guildData.botsWlStatus == true) {
                if (oldMember.user.bot) {
                    if (oldMember.user.id == client.user.id) return
                    let whitelistedbots = guildData.botWl
                    if (!whitelistedbots.includes(oldMember.user.id)) {
                        newMember.roles.cache.forEach(async role => {
                            if (newMember.guild.roles.everyone == role) return
                            if (role.permissions.has(PermissionFlagsBits.Administrator)) {
                                if(!role.editable) return;
                                if(role.managed) return role.permissions.remove(role.permissions);
                                await newMember.roles.remove(role, [`Bot is not whitelisted`]).catch(e => console.log(e))
                            }
                        });
                    }
                }
            }


        } catch (error) {
            console.log(error);
        }
    },
};
