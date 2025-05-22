const {
	ChatInputCommandInteraction,
	SlashCommandBuilder,
	EmbedBuilder,
	PermissionFlagsBits,
	ActionRowBuilder,
	StringSelectMenuBuilder,
	ButtonBuilder,
	ChannelType,
} = require("discord.js");
const guildDb = require("../../../schemas/guild");
const logDb = require("../../../schemas/logs");

module.exports = {
	category: 'setup',
	usage: "autosetup",
	owner: true,
	structure: new SlashCommandBuilder()
		.setName("autosetup")
		.setDescription("Automatically sets up your guild"),
	/**
	 * @param {ChatInputCommandInteraction} interaction
	 * @param {Client} client
	 */
	run: async (client, interaction) => {
		try {
			await interaction.reply({
				content: "Starting auto setup...",
			});

			const { guild, channel, user, member } = interaction;
			
			// Fetch guild and log data or create if not exist
			let guildData = await guildDb.findOneAndUpdate(
				{ guildId: guild.id },
				{ $setOnInsert: { guildId: guild.id } },
				{ upsert: true, new: true }
			);
			let logsData = await logDb.findOneAndUpdate(
				{ guildId: guild.id },
				{ $setOnInsert: { guildId: guild.id } },
				{ upsert: true, new: true }
			);

			// Check if member is the server owner
			if (member.id !== guild.ownerId) {
				return await interaction.editReply({
					content: "Only the server owner can use this command.",
					ephemeral: true,
				});
			}

			// Define features for setup
			let features = [
				{ label: "verification", value: "verification", emoji: "✅" },
				{ label: "welcome", value: "welcome", emoji: "👋" },
				{ label: "leave", value: "leave", emoji: "👋" },
				{ label: "bot-wl", value: "bot-wl", emoji: "🤖" },
				{ label: "bot-logs", value: "bot-logs", emoji: "📜" }
			];
			
			// Create selection menu and confirm button
			let selectMenu = new ActionRowBuilder().addComponents(
				new StringSelectMenuBuilder()
					.setOptions(features)
					.setCustomId("auto-setup")
					.setMinValues(1)
					.setMaxValues(5)
					.setPlaceholder("Select features to enable")
			);
			let confirmButton = new ActionRowBuilder().addComponents(
				new ButtonBuilder()
					.setCustomId("auto-setup-confirm")
					.setLabel("Confirm")
					.setStyle("Success")
					.setEmoji("✅")
			);

			await interaction.editReply({
				content: "Please select the features you want to auto-setup:",
				components: [selectMenu],
			});

			const filter = (i) => i.user.id === user.id && i.customId.startsWith("auto-setup");
			const collector = channel.createMessageComponentCollector({
				filter,
				time: 30000,
			});

			let selectedFeatures = [];
			let confirmed = false;

			collector.on("collect", async (int) => {
				if (int.customId === "auto-setup") {
					await int.deferUpdate();
					selectedFeatures = int.values;

					// Show confirmation embed with the selected features
					const featureStatus = features.map(f => `> ${f.label}: ${selectedFeatures.includes(f.value) ? "✅" : "❌"}`).join("\n");
					await interaction.editReply({
						embeds: [
							new EmbedBuilder().setTitle("Confirm Your Selection")
								.setDescription(`${featureStatus}\n\nAre you sure?`)
						],
						components: [confirmButton],
					});
				} else if (int.customId === "auto-setup-confirm") {
					confirmed = true;
					await interaction.editReply({
						embeds: [
							new EmbedBuilder().setTitle("Auto Setup")
								.setDescription(`Auto setup initiated...\nPlease wait while we set up your selected features.`)
						],
						components: [],
					});
					collector.stop();
				}
			});

			collector.on("end", async () => {
				if (!confirmed) {
					await interaction.editReply({
						content: "Auto setup cancelled.",
						components: [],
					});
					return;
				}

				// Begin auto-setup process
				let result = "";
				let SetupCategory = await guild.channels.create({
					name: "🔰 | Important",
					type: ChannelType.GuildCategory,
					reason: "Auto Setup",
				});

				// Setup each selected feature
				if (selectedFeatures.includes("verification")) {
					let verRole = await guild.roles.create({
						name: "Verified",
						color: "Green",
						reason: "Verification Auto Setup",
						permissions: []
					});
					let verChannel = await guild.channels.create({
						parent: SetupCategory.id,
						name: "verification",
						type: ChannelType.GuildText,
						reason: "Verification Auto Setup",
						permissionOverwrites: [
							{ id: guild.id, allow: [PermissionFlagsBits.ViewChannel], deny: [PermissionFlagsBits.SendMessages] },
							{ id: verRole.id, deny: [PermissionFlagsBits.ViewChannel] },
						],
					});
					await guildData.updateOne({
						verificationStatus: true,
						verificationChannel: verChannel.id,
						verifiedRole: verRole.id,
					});
					result += `> Verification: ✅\n - Channel: ${verChannel}\n - Role: ${verRole}\n\n`;
				}
				if (selectedFeatures.includes("welcome")) {
					let welcomeChannel = await guild.channels.create({
						parent: SetupCategory.id,
						name: "welcome",
						type: ChannelType.GuildText,
						reason: "Welcome Auto Setup",
					});
					await guildData.updateOne({
						welcomeChannel: welcomeChannel.id,
						welcomeMessage: `Welcome to ${interaction.guild.name}! We're glad you joined us.`,
					});
					result += `> Welcome: ✅\n - Channel: ${welcomeChannel}\n\n`;
				}
				// Add more features based on the `selectedFeatures`

				await interaction.editReply({
					content: `Auto Setup Complete\n\n${result}`,
					components: [],
				});
			});
		} catch (error) {
			console.error(error);
			await interaction.editReply({
				content: "An error occurred during the auto-setup process. Please try again.",
			});
		}
	},
};
