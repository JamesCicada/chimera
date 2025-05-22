const {
	Message,
	EmbedBuilder,
	ChatInputCommandInteraction,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const mongoose = require("mongoose");

module.exports = {
	structure: {
		name: "banner",
		description: "Banner of a user/members",
		cooldown: 5000,
	},
	/**
	 * @param {ExtendedClient} client
	 * @param {Message} message
	 * @param {string[]} args
	 */
	run: async (client, message, args) => {
        const interaction = message;
		let targetUser = message.mentions.users.first() || client.users.cache.get(args[0]) || interaction.author;
        let targetMember = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || interaction.member;
        let userForce = await client.users.fetch(targetMember, {
            force: true,
        });
        let banner = userForce.bannerURL({ size: 1024, dynamic: true });
        if(!banner) return message.reply({
            content: `The mentioned member has no banner`,
        });
        let embed = new EmbedBuilder()
            .setTitle(`${targetUser.username}'s avatar`)
            .setImage(banner)
            .setFooter({
                text: `Requested by ${interaction.author ? interaction.author.username : interaction.user.username}`,
                IconURL: interaction.author? interaction.author.displayAvatarURL({
                    dynamic: true,
                    size: 4096,
                }) : interaction.user.displayAvatarURL({
                    dynamic: true,
                    size: 4096,
                }),
            })
            .setColor("Random");
        try {
            interaction.reply({ embeds: [embed] });
        } catch (error) {
            interaction.reply({
                content: `There was an error please check my permissions`,
                ephemeral: true,
            });
            console.log(error);
        }
	},
};
