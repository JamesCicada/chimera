const {
	ChatInputCommandInteraction,
	SlashCommandBuilder,
	Client,
	EmbedBuilder,
	PermissionFlagsBits,
} = require("discord.js");
const randomColor = require("randomcolor");
const guildDb = require("../../../schemas/guild");
const { sendLogs } = require("../../../Functions/actionLogs");
module.exports = {
	category: 'protection',
	usage: "whitelist [add/remove/list]",
	structure: new SlashCommandBuilder()
		.setName("whitelist")
		.setDescription("add a bot to whitelist so they can get admin perms")
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.addSubcommand((command) =>
			command
				.setName("add")
				.setDescription("add a bot to the whitelist")
				.addUserOption((option) =>
					option
						.setName("add-bot-id")
						.setDescription("Bot to be added to wl")
						.setRequired(true)
				)
		)
		.addSubcommand((command) =>
			command
				.setName("remove")
				.setDescription("remove a bot from whitelist")
				.addUserOption((option) =>
					option
						.setName("remove-bot-id")
						.setDescription("Bot to be removed from wl")
						.setRequired(true)
				)
		)
		.addSubcommand((command) =>
			command
				.setName("list")
				.setDescription("list of bots ids in whitelist")
		),
	/**
	 * @param {ChatInputCommandInteraction} interaction
	 * @param {Client} client
	 */
	run: async (client, interaction) => {
		try {
			if (
				interaction.member.roles.highest <=
					interaction.guild.client.roles &&
				interaction.guild.client.roles.highest &&
				interaction.member.id !== interaction.guild.ownerId
			)
				return interaction.reply({
					content: `You should have a hgiher role than me or be the owner to do that`,
					ephemeral: true,
				});
			let inter = interaction.options;
			let guildData = await guildDb.findOne({
				guildId: interaction.guild.id,
			});
			if (!guildData) {
				await guildDb.create({
					guildId: interaction.guild.id,
				});
			}
			guildData = await guildDb.findOne({
				guildId: interaction.guild.id,
			});
			if (!guildData.botsWlStatus || guildData.botsWlStatus != true)
				return interaction.reply({
					content: `The Bot's Whitelist Feature is not enabled in this server use /features to enable it`,
					ephemeral: true,
				});
			switch (inter.getSubcommand()) {
				case "add":
					{
						let bot = interaction.options.getMember("add-bot-id");
						if (!bot)
							return interaction.reply({
								content: `This Bot isn't a member of this server invite the bot first then add it to wl`,
								ephemeral: true,
							});
						if (!bot.user.bot)
							return interaction.reply({
								content: `This member isn't a bot`,
								ephemeral: true,
							});
						if (guildData.botWl.includes(bot.id))
							interaction.reply({
								content: `This bot is already Whitelisted`,
								ephemeral: true,
							});
						await guildData.updateOne({
							$addToSet: {
								botWl: bot.id,
							},
						});
						interaction.reply({
							content: `bot was added to whitelist`,
							ephemeral: true,
						});
						await sendLogs(interaction.guild, "Whitelist", {
							description: `${interaction.user} Added ${bot.user}(${bot.id}) to Whitelist`,
							color: "Green",
							avatarURL: interaction.user.displayAvatarURL(),
							username: interaction.user.username,
						});
					}
					break;
				case "remove":
					{
						let bot =
							interaction.options.getMember("remove-bot-id");
						if (!bot)
							return interaction.reply({
								content: `This Bot isn't a member of this server`,
								ephemeral: true,
							});
						if (!bot.user.bot)
							return interaction.reply({
								content: `This member isn't a bot`,
								ephemeral: true,
							});
						if (!guildData.botWl.includes(bot.id))
							interaction.reply({
								content: `This bot is not Whitelisted`,
								ephemeral: true,
							});
						await guildData.updateOne({
							$pull: {
								botWl: bot.id,
							},
						});
						bot.roles.cache.forEach(async (role) => {
							if (
								role.permissions.has(
									PermissionFlagsBits.Administrator
								)
							) {
								await bot.roles
									.remove(role, [
										`Bot removed from whitelisted`,
									])
									.catch((e) => console.log(e));
							}
						});
						interaction.reply({
							content: `bot was removed from whitelist`,
							ephemeral: true,
						});
						await sendLogs(interaction.guild, "Whitelist", {
							description: `${interaction.user} Removed ${bot.user}(${bot.id}) to Whitelist`,
							color: "Red",
							avatarURL: interaction.user.displayAvatarURL(),
							username: interaction.user.username,
						});
					}
					break;
				case "list":
					{
						let botsList = guildData.botWl;
						//console.log(botsList);
						if (!botsList || botsList <= 0)
							return interaction.reply({
								content: `This server has no whitelisted bots`,
								ephemeral: true,
							});
						let bots = [];
						botsList.forEach(async (bot) => {
							console.log(bot);
							bots.push(`> <@${bot}> (${bot})`);
						});
						await interaction.reply({
							embeds: [
								new EmbedBuilder().setTitle(
									`this guild has ${botsList.length} Whitelisted bots:`
								).setDescription(`
                                ${bots.join("\n\n")}
                                `),
							],
						});
					}
					break;
			}
		} catch (err) {
			console.log(err);
			interaction.reply({
				content: `There was an error please check my permissions`,
				ephemeral: true,
			});
		}
	},
};
