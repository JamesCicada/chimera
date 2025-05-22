const { ActivityType, Client, EmbedBuilder } = require("discord.js");
const mongoose = require('mongoose')
const guildDb = require('../../schemas/guild')
module.exports = {
    event: "guildMemberRemove",
    run: async (client, member) => {

        try {
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
            if (guildData.byeStatus || guildData.byeStatus == true) {
                let byeChannel = guild.channels.cache.get(guildData.byeChannel)
                console.log(byeChannel.name, ' - ', byeChannel.id);
                let byeMessage = `${guildData.byeMessage}` || `see ya!`
                let byeImage = guildData.byeImages || guild.iconURL()
                var embedTemp = new EmbedBuilder().setColor('DarkButNotBlack')
                await byeChannel.send({
                    embeds: [
                        embedTemp.setAuthor({
                            name: ` ${member.user.tag} left the server`,
                            iconURL: member.user.displayAvatarURL() || guild.iconURL()
                        }).setTitle(`${byeMessage}`)
                            .setImage(
                                `${byeImage || guild.iconURL()}`
                            ).setThumbnail(`${member.user.displayAvatarURL() || guild.iconURL()}`)
                    ]
                }).catch(console.error)
            }

        } catch (error) {
            console.log(error);
        }
    },
};
