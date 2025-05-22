const { Client, EmbedBuilder, Guild } = require("discord.js");
/**
 * @param { Guild } guild
 */
module.exports = {
    event: "guildDelete",
    /**
     * 
     * @param {Client} client 
     * @param {Guild} guild 
     */
    run: async (client, guild) => {

        try {
            let logsChannel = client.channels.cache.get('1190113670315909211')
            await logsChannel.send({
                embeds: [
                    new EmbedBuilder().setAuthor({
                        name: `${guild.name || 'none'}`,
                        iconURL: `${guild.iconURL() || client.user.displayAvatarURL()}`
                    }).setTitle(`Left guild`).setDescription(
                        `
                        > ID: ${guild.id}

                        > Name: ${guild.name}

                        > MemberCount: ${guild.memberCount}
                        `
                    ).setColor('Red')
                ]
            })
        } catch (error) {
            console.log(error);
        }
    },
};
