const gDb = require("../../schemas/guild");
const moment = require("moment");
const { WebhookClient, EmbedBuilder } = require("discord.js");
const hook = process.env.premlogshook;
async function checkPremiums(client) {
    const guilds = await gDb.find({});
    for (const guild of guilds) {
        const server = client.guilds.cache.get(guild.guildId);
        if(!guild.premium) return;
        const status = guild.premium["status"]
        if(!status) return;
        const endsAt = moment(guild.premium["end"]);
        const now = moment();
        if(now.isAfter(endsAt)) {
            guild.premium["status"] = false;
            guild.save();
            const webhook = new WebhookClient({ url: hook });
            webhook.send({ 
                embeds: [
                    new EmbedBuilder()
                    .setTitle("Premium Expired")
                    .setDescription(`
                    > Guild: ${server.name || 'Unknown'} (${server.id})
                    
                    > Started: <t:${moment(guild.premium["started"]).unix()}:R>

                    > Expired: <t:${moment(guild.premium["end"]).unix()}:R>

                    > Type: ${guild.premium["type"]}
                    `)
                    .setColor("Red")
                ] 
            })
        } 
    }
}
module.exports = { checkPremiums }
// cronJob("* * 0 * * *", checkPremiums(), null, true)