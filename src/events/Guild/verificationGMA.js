const { ActivityType, Client, EmbedBuilder } = require("discord.js");
const mongoose = require('mongoose')
const guildDb = require('../../schemas/guild')
const moment = require('moment')
module.exports = {
    event: "guildMemberAdd",
    run: async (client, member) => {

        try {
            if(member.user.bot) return;
            let guild = member.guild
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
            if (guildData.welcomeStatus || guildData.welcomeStatus == true) {
                let welcomeChannel = guild.channels.cache.get(guildData.welcomeChannel)
                let welcomeMessage = `${guildData.welcomeMessage}` || `welcome to our server`
                let welcomeImage = guildData.welcomeImages || guild.iconURL()
                var embedTemp = new EmbedBuilder().setColor('DarkButNotBlack')
                await welcomeChannel.send({
                    embeds: [
                        embedTemp.setAuthor({
                            name: ` ${member.user.tag} just joined!`,
                            iconURL: member.user.displayAvatarURL() || guild.iconURL()
                        }).setTitle(`${welcomeMessage}`)
                            .setImage(
                                `${welcomeImage || guild.iconURL()}`
                            ).setThumbnail(`${member.user.displayAvatarURL() || guild.iconURL()}`)
                    ]
                }).catch((e) => {
                    console.log(e);
                })
            }
            if (!guildData.verificationStatus || !guildData.verificationReq) return
            let verifyAge = guildData.verificationReq
            if (verifyAge == 0) {
                let verifyRole = guildData.verifiedRole
                await member.roles.add(verifyRole, ['verified for account age'])
            }
            let ageToIso = moment().subtract(verifyAge, 'months').valueOf()
            if (member.user.createdTimestamp <= ageToIso) {
                let verifyRole = guildData.verifiedRole
                await member.roles.add(verifyRole, ['verified for account age'])
            }


        } catch (error) {
            console.log(error);
        }
    },
};
