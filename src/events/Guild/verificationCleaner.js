const { ActivityType, Client, EmbedBuilder, ChannelType } = require("discord.js");
const mongoose = require('mongoose')
const guildDb = require('../../schemas/guild')
const moment = require('moment')
module.exports = {
    event: "messageCreate",
    run: async (client, message) => {

        try {
            if(message.channel.type !== ChannelType.GuildText) return
            let guild = message.guild
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
            if (!guildData.verificationStatus || !guildData.verificationReq) return
            let verificationMessage = guildData.verificationMessage
            let verificationChannel = guildData.verificationChannel
            if (message.channel.id == verificationChannel && message.id != verificationMessage && message.author.id != client.user.id) {
                message.delete().catch((err) => {
                    console.log(err);
                })
            }

        } catch (error) {
            console.log(error);
        }
    },
};
