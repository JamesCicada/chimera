const gDb = require("../../schemas/guild");
const mDb = require("../../schemas/member");
const moment = require("moment");
const { EmbedBuilder, Client } = require("discord.js");
const { sendLogs } = require("../../Functions/actionLogs");
/**
 * 
 * @param {Client} client 
 * @returns 
 */
async function checkTempRoles(client) {
    const members = await mDb.find({});
    for (const member of members) {
        const server = client.guilds.cache.get(member.guildId);
        if(!member.tempRoles) return;
        const roles = member.tempRoles;
        for (const role of roles) {
            const endsAt = role.endsAt;
            const now = moment().unix();
            if(now >= endsAt) {
                const rRole = server.roles.cache.get(role.roleId);
                const mem = server.members.cache.get(member.memberId);
                await member.updateOne({
                    $pull: {
                        tempRoles: role
                    }
                })
                await mem.roles.remove(rRole.id, ['Temp Role expired']).catch((e) => console.log(e));
                sendLogs(server, 'Temp Role Expired', {
                    description: `**Moderator:** <@${role.moderatorId}>\n**Member:** <@${member.memberId}>\n**Role:** ${rRole}`,
                    color: "Red",
                    avatarURL: mem.user.displayAvatarURL(),
                    username: mem.user.username
                })
            }
        }
    }
}
module.exports = { checkTempRoles }
// cronJob("* * 0 * * *", checkPremiums(), null, true)