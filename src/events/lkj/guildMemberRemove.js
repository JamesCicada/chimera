const { Client, EmbedBuilder, WebhookClient } = require("discord.js");
const logsDb = require("../../schemas/logs");
const memberDb = require('../../schemas/member');
const { getResMem } = require('../../Functions/getResponsible');

module.exports = {
    event: "guildMemberRemove",
    /**
     * 
     * @param {Client} client 
     * @param {GuildMember} member 
     */
    run: async (client, member) => {
        try {
            const guildDb = await logsDb.findOne({
                guildId: member.guild.id
            });
            let memberData = await memberDb.findOne({
                memberId: member.id,
                guildId: member.guild.id
            })
            let inviter;
            if (memberData) {
                inviter = memberData.invitedBy
            }
            let inviterData = await memberDb.findOne({
                memberId: inviter,
                guildId: member.guild.id
            })
            if (inviterData) {
                await inviterData.updateOne({
                    $pull: {
                        invites: member.id
                    }
                })
            }
            const responsibleMember = await getResMem(client, member.guild, 'MemberKick', true);
            if (responsibleMember) {
                if (!guildDb || !guildDb.logStatus.kick || !guildDb.logChannels.kick) return;
                const whook = new WebhookClient({
                    url: guildDb.logChannels.kick
                });
                if (!whook) return;

                const embed = new EmbedBuilder()
                    .setThumbnail(member.user.displayAvatarURL())
                    .setColor('Red');



                if (responsibleMember) {
                    embed.setDescription(`
                    ### Member Kicked

                    > Kicked Member: ${member.user.tag} (${member.user.id})

                    > Moderator: ${responsibleMember} (${responsibleMember.id})
                    ${inviter ? `\n\n> They Were Invited By: <@${inviter}> (${inviter})` : ''}
                    `)
                }

                whook.send({ embeds: [embed] }).catch(console.error);
            } else {
                if (!guildDb || !guildDb.logStatus.leave || !guildDb.logChannels.leave) return;
                const whook = new WebhookClient({
                    url: guildDb.logChannels.leave
                });
                if (!whook) return;

                const embed = new EmbedBuilder()
                    .setThumbnail(member.user.displayAvatarURL())
                    .setColor('Red');

                embed.setDescription(`
                    ### Member Left

                    > ${member.user.tag} (${member.user.id})
                    ${inviter ? `\n\n> They Were Invited By: <@${inviter}> (${inviter})` : ''}
                 `)

                whook.send({ embeds: [embed] }).catch(console.error);
            }



        } catch (error) {
            console.log(error);
        }
    },
};
