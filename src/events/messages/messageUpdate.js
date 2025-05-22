const { Client, WebhookClient, Message, EmbedBuilder } = require("discord.js");
const logsDb = require("../../schemas/logs");
const { getResMem } = require('../../Functions/getResponsible');

module.exports = {
    event: "messageUpdate",
    /**
     * 
     * @param {Client} client 
     * @param {Message} oldMessage 
     * @param {Message} newMessage 
     */
    run: async (client, oldMessage, newMessage) => {
        try {
            const guildDb = await logsDb.findOne({
                guildId: oldMessage.guild.id
            });

            if (!guildDb || !guildDb.logStatus.messages || !guildDb.logChannels.messages) return;

            // Here, the guild has message logs enabled
            const whook = new WebhookClient({
                url: guildDb.logChannels.messages
            });

            if (!whook) return;
            if (!newMessage?.author?.id) return;

            const oldContent = oldMessage.content;
            const newContent = newMessage.content;

            if (oldContent === newContent) return; // Message content did not change

            const content = "\n```diff\n- " + oldContent + "\n\n+ " + newContent + "\n```";

            const embed = new EmbedBuilder().setDescription(`
            ### Message Update

            > Author: ${newMessage.author} (${newMessage.author.id})

            > Channel: ${newMessage.channel} (${newMessage.channel.id})

            > Changes: ${content}
            `).setColor('Yellow')

            if (whook.id === newMessage.author.id) return;
            whook.send({ embeds: [embed] }).catch(console.error);
        } catch (error) {
            console.log(error);
        }
    },
};
