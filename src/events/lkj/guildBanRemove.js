const { Client, EmbedBuilder, WebhookClient} = require("discord.js");
const logsDb = require("../../schemas/logs");
const { getResMem } = require('../../Functions/getResponsible');

module.exports = {
    event: "guildBanRemove",
    run: async (client, ban) => {
        try {
            console.log('1');
            const {guild, user, reason} = ban
            const guildDb = await logsDb.findOne({
                guildId: guild.id
            });
            if (!guildDb || !guildDb.logStatus.ban || !guildDb.logChannels.ban) return;
            console.log('2');

            const whook = new WebhookClient({
                url: guildDb.logChannels.ban
            });
            console.log('3');

            if (!whook) return;

            const embed = new EmbedBuilder()
                .setThumbnail(guild.iconURL() || client.user.displayAvatarURL())
                .setColor('Green');
                console.log('4');

            const responsibleMember = await getResponsible(guild, 'MemberBanRemove', true);

            if (responsibleMember) {
                embed.setDescription(`
                ### Member Ban

                > Banned Member: ${user.tag} (${user.id})

                > Moderator: ${responsibleMember} (${responsibleMember.id})
                `)
            }

            whook.send({ embeds: [embed] }).catch(console.error);
        } catch (error) {
            console.log(error);
        }
    },
};
