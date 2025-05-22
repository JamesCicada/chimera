const {
	Message,
	EmbedBuilder,
	ChatInputCommandInteraction,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const mongoose = require("mongoose");

module.exports = {
	structure: {
		name: "avatar",
		description: "Avatar of a user/members",
		aliases: ["a", "av"],
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

        let avatar = targetMember.displayAvatarURL({ dynamic: true, size: 4096 }) || targetUser.displayAvatarURL({ dynamic: true, size: 4096 });
        let embed = new EmbedBuilder()
            .setTitle(`${targetUser.username}'s avatar`)
            .setImage(avatar)
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
