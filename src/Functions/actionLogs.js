const gDb = require("../schemas/guild");
const {WebhookClient, EmbedBuilder, ActionRowBuilder, ButtonBuilder} = require('discord.js')
async function sendLogs(guild, action, data = {
    description: '',
    color: '',
    avatarURL: '',
    username: '',
    content: '',
}) {
    const g = await gDb.findOne({ guildId: guild.id });
    if (!g || !g.logsStatus || !g.logsChannel) return;
    const hook = new WebhookClient({ url: g.logsChannel });
    if(!hook) return
    const embed = new EmbedBuilder()
    .setTitle(`${action} Logs`)
    .setDescription(data.description)
    .setColor(data.color || 'Aqua')
    .setTimestamp()
    await hook.send({
        avatarURL: data.avatarURL,
        username: data.username,
        content: data.content || '',
        embeds: [embed],
        components: [
            new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId(`${Date.now().valueOf()}`).setLabel("Chimera Logs").setStyle("Secondary").setDisabled(true)
            )
        ]
    }).catch((e) => console.log(e))
}
module.exports = { sendLogs }