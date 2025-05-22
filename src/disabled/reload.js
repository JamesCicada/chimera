const {
	Client,
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	SlashCommandBuilder
} = require("discord.js");
module.exports = {
	developers: true,
	structure: new SlashCommandBuilder()
		.setName("reload")
		.setDescription("reload commands or events (dev only)")
		.setDefaultMemberPermissions(4)
		// .addStringOption((option) =>
		// 	option
		// 		.setName("cat")
		// 		.setDescription("what do you want to reload?")
		// 		.setRequired(true)
		// 		.addChoices(
		// 			{ name: "commands", value: "commands" },
		// 			{ name: "events", value: "events" },
		// 			{ name: "panel", value: "panel" }
		// 		)
		//)
		,
		run: async (client, interaction) => {
		try {
			// const choices = interaction.options.getString("cat");
			// switch (choices) {
			// 	case "commands":
			// 		{
			// 			//client.commands.clear()
			// 			interaction
			// 				.reply("reloaded commands successfully")
			// 				.then(() => {
			// 					loadCommands(client);
			// 				});
			// 		}
			// 		break;
			// 	case "events":
			// 		{
			// 			//client.events.clear()
			// 			interaction
			// 				.reply("reloaded events successfully")
			// 				.then(() => {
			// 					loadEvents(client);
			// 				});
			// 		}
			// 		break;
				// case "panel":
					// {
						let embed = new EmbedBuilder()
							.setTitle("Chimera Reload Panel")
							.setImage(
								"https://media.tenor.com/ECXhHWdn33UAAAAC/reload-fun.gif"
							);
						let buttons = new ActionRowBuilder().addComponents(
							new ButtonBuilder()
								.setLabel("Commands")
								.setCustomId("commandsReload")
								.setStyle(2)
								.setEmoji(
									"<:chimera_channel:1189615776953548931> "
								),
							new ButtonBuilder()
								.setLabel("Events")
								.setCustomId("eventsReload")
								.setStyle(2)
								.setEmoji(
									"<:chimera_verified:1189612874012827769>"
								)
						);
						interaction.reply({
							embeds: [embed],
							components: [buttons],
						});
			// 		}
			// 		break;
			// }
		} catch (err) {
			console.log(err);
		}
	},
};
