const { ActivityType, Client, EmbedBuilder, PermissionFlagsBits, MessageReaction, GuildMember, GuildChannel } = require("discord.js");
const mongoose = require('mongoose')
const { translate } = require('@vitalets/google-translate-api')
const guildDb = require('../../schemas/guild')
const usersDb = require('../../schemas/user');
const user = require("../../schemas/user");
module.exports = {
    event: "messageReactionAdd",
    /**
     * 
     * @param {MessageReaction} reaction
     * @param {Client} client
     * @param {GuildChannel} channel
     */
    run: async (client, reaction, member) => {
        try {
            if (member.bot) return
            //await reaction.fetch()
            //console.log(member);
            //if (member.id != '370995733509177355') return console.log(reaction.emoji);
            if (reaction.emoji.name != '🔤') return console.log(reaction.emoji.name);
            let message = reaction.message
            let guild = reaction.message.guildId
            let channel = reaction.message.channelId
            //console.log(message, ' ', channel, ' ', guild,' ');
            let userDb = await usersDb.findOne({
                userId: member.id
            })
            if (!userDb.language || userDb.language == '') return
            let langs = [
                {
                    name: 'English',
                    value: 'en'
                },
                {
                    name: 'Spanish',
                    value: 'es'
                },
                {
                    name: 'French',
                    value: 'fr'
                },
                {
                    name: 'German',
                    value: 'de'
                },
                {
                    name: 'Italian',
                    value: 'it'
                },
                {
                    name: 'Portuguese',
                    value: 'pt'
                },
                {
                    name: 'Russian',
                    value: 'ru'
                },
                {
                    name: 'Chinese',
                    value: 'zh'
                },
                {
                    name: 'Japanese',
                    value: 'ja'
                },
                {
                    name: 'Korean',
                    value: 'ko'
                },
                {
                    name: 'Arabic',
                    value: 'ar'
                },
                {
                    name: 'Hindi',
                    value: 'hi'
                },
                {
                    name: 'Bengali',
                    value: 'bn'
                },
                {
                    name: 'Indonesian',
                    value: 'id'
                },
                {
                    name: 'Turkish',
                    value: 'tr'
                },
                {
                    name: 'Dutch',
                    value: 'nl'
                },
                {
                    name: 'Swedish',
                    value: 'sv'
                },
                {
                    name: 'Polish',
                    value: 'pl'
                },
                {
                    name: 'Greek',
                    value: 'el'
                },
                {
                    name: 'Czech',
                    value: 'cs'
                }
            ]
            function getNameByValue(value) {
                for (let i = 0; i < langs.length; i++) {
                    if (langs[i].value === value) {
                        return langs[i].name;
                    }
                }
                return null;
            }
            guild = client.guilds.cache.get(guild)
            channel = guild.channels.cache.get(channel)
            let perms = channel.permissionsFor(member.id)
            if (!perms.has(PermissionFlagsBits.SendMessages)) return
            channel.sendTyping()
            let lang = userDb.language
            let guildMember = guild.members.cache.get(member.id)
            let msg = `${message.content}`
            if(message.embeds.length > 0){
                let embed = message.embeds[0].toJSON()
                msg = `${message.content}\n${JSON.stringify(embed)}`
            }
            let { text } = await translate(msg, { to: lang })
            channel.send({
                content: `${member}`,
                embeds: [
                    new EmbedBuilder().setAuthor({
                        name: `${message.author.username || 'unknown'} `,
                        iconURL: message.author.displayAvatarURL() || client.user.displayAvatarURL()
                    }).setDescription(`
                    **Translated To:** _**${getNameByValue(lang)}**_
                    ${text}
                    `).setFooter({
                        text: `requested by ${member.tag}`,
                        iconURL: member.displayAvatarURL()
                    })
                ]
            }).catch((err) => {
                console.log(err);
            })
        } catch (error) {
            console.log(error);
        }
    },
};
