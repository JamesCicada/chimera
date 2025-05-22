const {
    Message,
    EmbedBuilder,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
module.exports = {
	structure: {
		name: "about",
		description: "About Chimera!",
		aliases: ["chimera"],
		cooldown: 5000,
	},
	/**
	 * @param {ExtendedClient} client
	 * @param {Message} message
	 * @param {string[]} args
	 */
	run: async (client, message, args) => {
        let embed = new EmbedBuilder().setAuthor({
            name: `About Chimera`,
            iconURL: `${client.user.displayAvatarURL()}`
        }).setColor('Fuchsia').setDescription(`
        > <:chimera_dev:1189612097617805433> **Devs**: **Chimera**

        > <:chimera_insights:1189612868933517423> **Servers**: \`${client.guilds.cache.size}\`
        
        > <:chimera_members:1189612864516935862> **Users**: \`${client.guilds.cache.reduce((a, b) => a + b.memberCount, 0)}\`
        `)
        try {
            await message.reply({ embeds: [embed] });
        } catch (err) {
            message.reply({
                content: `There was an error please check my permissions`,
                ephemeral: true,
            });
            console.log(err);
        }
	},
};
