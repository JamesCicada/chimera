const { Client, WebhookClient, EmbedBuilder, GuildMember } = require("discord.js");
const logsDb = require("../../schemas/logs");
const { getResMem } = require('../../Functions/getResponsible');

module.exports = {
    event: "guildMemberUpdate",
    /**
     * 
     * @param {Client} client 
     * @param {GuildMember} oldMember 
     * @param {GuildMember} newMember 
     */
    run: async (client, oldMember, newMember) => {
        try {
            const guildDb = await logsDb.findOne({
                guildId: newMember.guild.id
            });



            // Here, the guild has role logs enabled


            const embed = new EmbedBuilder()
                .setThumbnail(newMember.user.displayAvatarURL() || newMember.guild.iconURL() || client.user.displayAvatarURL());

            // Check if roles were added
            if (oldMember.roles.cache.size < newMember.roles.cache.size) {
                if (!guildDb || !guildDb.logStatus.roles || !guildDb.logChannels.roles) return;
                const whook = new WebhookClient({
                    url: guildDb.logChannels.roles
                });

                if (!whook) return;
                const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));

                if (addedRoles.size > 0) {
                    const responsibleMember = await getResMem(client, newMember.guild, 'RoleUpdate');
                    const addedRolesStr = addedRoles.map(role => `${role}`).join(', ');

                    if (responsibleMember) {
                        embed.setColor('Green')
                            .setDescription(`
                            ### Roles Added
    
                            > Member: ${newMember} (${newMember.id})
    
                            > Added Roles: ${addedRolesStr}
    
                            > Moderator: ${responsibleMember} (${responsibleMember.id})
                            `);
                    } else {
                        embed.setColor('Green')
                            .setDescription(`
                            ### Roles Added
    
                            > Member: ${newMember} (${newMember.id})
    
                            > Added Roles: ${addedRolesStr}
                            `);
                    }

                    whook.send({ embeds: [embed] }).catch(console.error);
                }
            }

            // Check if roles were removed
            if (oldMember.roles.cache.size > newMember.roles.cache.size) {
                if (!guildDb || !guildDb.logStatus.roles || !guildDb.logChannels.roles) return;
                const whook = new WebhookClient({
                    url: guildDb.logChannels.roles
                });

                if (!whook) return;
                const removedRoles = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id));

                if (removedRoles.size > 0) {
                    const responsibleMember = await getResMem(client, newMember.guild, 'RoleUpdate');
                    const removedRolesStr = removedRoles.map(role => `${role}`).join(', ');

                    if (responsibleMember) {
                        embed.setColor('Red')
                            .setDescription(`
                            ### Roles Removed
    
                            > Member: ${newMember} (${newMember.id})
    
                            > Removed Roles: ${removedRolesStr}
    
                            > Moderator: ${responsibleMember} (${responsibleMember.id})
                            `);
                    } else {
                        embed.setColor('Red')
                            .setDescription(`
                            ### Roles Removed
    
                            > Member: ${newMember} (${newMember.id})
    
                            > Removed Roles: ${removedRolesStr}
                            `);
                    }

                    whook.send({ embeds: [embed] }).catch(console.error);
                }
            }
            if (oldMember.isCommunicationDisabled() !== newMember.isCommunicationDisabled()) {
                if (!guildDb || !guildDb.logStatus.timeout || !guildDb.logChannels.timeout) return;
                const whook = new WebhookClient({
                    url: guildDb.logChannels.timeout
                });

                if (!whook) return;
                
                const action = newMember.isCommunicationDisabled() ? 'Timed Out' : 'Timed In';

                whook.send({
                    embeds: [
                        embed.setColor('Yellow').setDescription(`
                        ### ${action}
    
                        > Member: ${newMember} (${newMember.id})

                        > Moderator: ${await getResMem(client, newMember.guild, 'MemberUpdate')}

                        ${action == 'Timed Out' ? `> Ends in: <t:${Math.floor(newMember.communicationDisabledUntilTimestamp / 1000)}:R>` : ``}
                        `)
                    ]
                }).catch((err) => {
                    console.log(err);
                });
            }
        } catch (error) {
            console.log(error);
        }
    },
};
