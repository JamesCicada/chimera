const { Client, EmbedBuilder, WebhookClient, Message } = require("discord.js");
const logsDb = require("../../schemas/logs");
const { getResMem } = require('../../Functions/getResponsible');

module.exports = {
    event: "messageDelete",
    /**
     * 
     * @param {Client} client 
     * @param {Message} message 
     */
    run: async (client, message) => {
        try {
            if(!message.guild) return
            const guildDb = await logsDb.findOne({
                guildId: message.guild.id
            });

            if (!guildDb || !guildDb.logStatus.messages || !guildDb.logChannels.messages) return;

            // Here, the guild has message logs enabled
            const whook = new WebhookClient({
                url: guildDb.logChannels.messages
            });

            if (!whook) return;
            if (!message?.author?.id) return
            const content = "\n```" + message.content + "\n```"
            const embed = new EmbedBuilder()
                .setThumbnail(message?.author?.displayAvatarURL() || message?.guild?.iconURL() || client?.user?.displayAvatarURL())
                .setColor('Red')
                .setDescription(`
                ### Message Deleted
    
                > Author: ${message.author} (${message.author.id})
    
                > Channel: ${message.channel} (${message.channel.id})
    
                ${message.content.length > 0 ? `> Message Content:
                ${content}
                `: ''}
                `);

            const responsibleMember = await getResMem(client, message.guild, 'MessageDelete');


            if (responsibleMember) {
                if (message.attachments.size > 0) {
                    let links = message.attachments.map((att) => att.url)
                    embed.setDescription(`
                ### Message Deleted
    
                > Author: ${message.author} (${message.author.id})
    
                > Channel: ${message.channel} (${message.channel.id})
                
                ${message.content.length > 0 ? `> Message Content: ${content}` : ''}
                
                > Attachments: 
                \`\`\`
                ${links.join('\n\n')}
                \`\`\`
                
                `)
                } else {
                    embed.setDescription(`
                ### Message Deleted
    
                > Author: ${message.author} (${message.author.id})
    
                > Channel: ${message.channel} (${message.channel.id})
                
                > Moderator: ${responsibleMember} (${responsibleMember.id})
    
                ${message.content.length > 0 ? `> Message Content: ${content}` : ''}
                `);
                }

            }

            if (whook.id === message.author.id) return
            whook.send({ embeds: [embed] }).catch(console.error);
            if (message.embeds.length > 0) {
                whook.send({ content: `These Embeds belong to the message above!`, embeds: message.embeds }).catch(console.error);
            }
        } catch (error) {
            console.log(error);
        }
    },
};
