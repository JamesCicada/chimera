const { Client, EmbedBuilder, WebhookClient, GuildMember} = require("discord.js");
const logsDb = require("../../schemas/logs");
const { getResMem } = require('../../Functions/getResponsible');

module.exports = {
    event: "guildMemberAdd",
    /**
     * 
     * @param {GuildMember} member 
     * @param {Client} client 
     * @returns 
     */
    run: async (client, member) => {
        try {
            const guildDb = await logsDb.findOne({
                guildId: member.guild.id
            });
            if (!guildDb || !guildDb.logStatus.guild || !guildDb.logChannels.guild) return;
            if (!member.user.bot) return

            const whook = new WebhookClient({
                url: guildDb.logChannels.guild
            });

            if (!whook) return;

            const embed = new EmbedBuilder()
                .setThumbnail(member.guild.iconURL() || client.user.displayAvatarURL())
                .setColor('Green');

            const responsibleMember = await getResMem(client, member.guild, 'botAdd');

            if (responsibleMember) {
                embed.setDescription(`
                ### Bot Added

                > Bot: ${member} (${member.id})

                > Moderator: ${responsibleMember} (${responsibleMember.id})
                `)
            }

            whook.send({ embeds: [embed] }).catch(console.error);
        } catch (error) {
            console.log(error);
        }
    },
};
