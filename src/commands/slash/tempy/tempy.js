const {
	ChatInputCommandInteraction,
	SlashCommandBuilder,
	EmbedBuilder,
	ChannelType,
	PermissionFlagsBits,
} = require("discord.js");
const duration = require("duration-js");
const ExtendedClient = require("../../../class/ExtendedClient");
const tempDb = require("../../../schemas/tempvc");
const { getOwner, getData } = require("../../../Functions/tempyFuncs");
module.exports = {
	category: 'tempy',
	usage: "tempy [name/limit/kick/lock/delete]",
	structure: new SlashCommandBuilder()
		.setName("tempy")
		.setDescription("manage your temp vc")
		.addSubcommand((subcommand) =>
			subcommand
				.setName("name")
				.setDescription("change temp vc name")
				.addStringOption((option) =>
					option
						.setName("name")
						.setDescription("set a custom naming")
						.setRequired(true)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("limit")
				.setDescription("change temp vc limit")
				.addIntegerOption((option) =>
					option
						.setName("limit")
						.setMaxValue(99)
						.setDescription("set a custom limit (0 = unlimited)")
						.setRequired(true)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("kick")
				.setDescription("kick a user from temp vc")
				.addUserOption((option) =>
					option
						.setName("kick-user")
						.setDescription("kick a user")
						.setRequired(true)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("lock")
				.setDescription("lock / unlock temp vc")
				.addBooleanOption((option) =>
					option
						.setName("lock-status")
						.setDescription("true = locked, false = unlocked")
						.setRequired(true)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("perm")
				.setDescription("give user permission to ur temp vc")
				.addUserOption((option) =>
					option
						.setName("allow-user")
						.setDescription("user to give permission")
						.setRequired(true)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("claim")
				.setDescription("claim this temp vc if owner is gone")
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("owner")
				.setDescription("set or check owner of temp vc")
				.addUserOption((option) =>
					option
						.setName("user")
						.setDescription("set owner of temp vc")
						.setRequired(false)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("hide")
				.setDescription("hide / unhide temp vc")
				.addBooleanOption((option) =>
					option
						.setName("hide-status")
						.setDescription("true = hidden, false = unhidden")
						.setRequired(true)
				))
		.addSubcommand((subcommand) =>
			subcommand.setName("help").setDescription("List of tempy commands")
		),
	options: {
		cooldown: 5000,
	},
	/**
	 * @param {ExtendedClient} client
	 * @param {ChatInputCommandInteraction} interaction
	 */
	run: async (client, interaction) => {
		const { options, user, guild, member } = interaction;
		if (!member.voice.channel)
			return await interaction.reply({
				content: "You are not in a vc!",
				ephemeral: true,
			});
		let tData = await tempDb.findOne({
			guildId: guild.id,
			cat: member.voice.channel.parentId,
		});
		if (!tData)
			return await interaction.reply({
				content: "You are not in a temp vc!",
				ephemeral: true,
			});
		const isOwner =
			(await getOwner(
				tData.creatorsId,
				member.voice.channel.id,
				guild.id
			)) === user.id;
		switch (options.getSubcommand()) {
			case "name": {
				if (!isOwner)
					return await interaction.reply({
						content: "You are not the owner of this temp vc!",
						ephemeral: true,
					});
				const name = options.getString("name");
				await member.voice.channel
					.setName(name, ["Chimera Tempvc rename"])
					.catch((e) => {
						return interaction.reply({
							content: `Error: ${e.message}`,
							ephemeral: true,
						});
					});
				await interaction.reply({
					content: `Name changed to ${name}`,
				});
				break;
			}
			case "limit": {
				if (!isOwner)
					return await interaction.reply({
						content: "You are not the owner of this temp vc!",
						ephemeral: true,
					});
				const limit =
					options.getInteger("limit") <= 100
						? options.getInteger("limit")
						: 0;
				await member.voice.channel.setUserLimit(limit).catch((e) => {
					return interaction.reply({
						content: `Error: ${e.message}`,
						ephemeral: true,
					});
				});
				await interaction.reply({
					content: `Limit changed to ${limit}`,
				});
				break;
			}
			case "kick": {
				if (!isOwner)
					return await interaction.reply({
						content: "You are not the owner of this temp vc!",
						ephemeral: true,
					});
				const mem = options.getMember("kick-user");
				if (mem.id === user.id)
					return await interaction.reply({
						content: "You can't kick yourself!",
						ephemeral: true,
					});
				await member.voice.channel.permissionOverwrites
					.edit(mem.id, {
						ViewChannel: null,
						Connect: false,
					})
					.catch((e) => {
						return interaction.reply({
							content: `Error: ${e.message}`,
							ephemeral: true,
						});
					});
				if (mem.voice.channelId == member.voice.channelId)
					await mem.voice.setChannel(tData.creatorsId).catch((e) => {
						return interaction.reply({
							content: `Error: ${e.message}`,
							ephemeral: true,
						});
					});
				let tempVc = tData.temps.find(
					(temp) => temp.vcId === member.voice.channelId
				);
				tempVc.rejected.push(mem.id);
				await tempDb.findOneAndUpdate(
					{ guildId: guild.id, creatorsId: tData.creatorsId },
					{ $set: { temps: tData.temps } },
					{ upsert: true }
				);
				await interaction.reply({
					content: `Kicked ${mem.user.username}`,
				});

				break;
			}
			case "lock": {
				if (!isOwner)
					return await interaction.reply({
						content: "You are not the owner of this temp vc!",
						ephemeral: true,
					});
				const lockStatus = options.getBoolean("lock-status");
				const currentLock = member.voice.channel
					.permissionsFor(guild.id)
					.has("Connect");
				if (currentLock !== lockStatus)
					return await interaction.reply({
						content: "This temp vc is already in that state!",
						ephemeral: true,
					});
				await member.voice.channel.permissionOverwrites
					.edit(member.voice.channel.guild.roles.everyone, {
						Connect: lockStatus ? false : null,
					})
					.catch((e) => {
						return interaction.reply({
							content: `Error: ${e.message}`,
							ephemeral: true,
						});
					});
				await interaction.reply({
					content: `This temp vc is ${
						lockStatus ? "locked" : "unlocked"
					}`,
				});
				break;
			}
			case "owner": {
				let tempVc = tData.temps.find(
					(temp) => temp.vcId === member.voice.channelId
				);
				const newOwner = options.getMember("user");
				if (!newOwner) {
					return interaction.reply({
						content: `Current owner: <@${tempVc.ownerId}>`,
					});
				} else {
					if (!isOwner)
						return await interaction.reply({
							content: "You are not the owner of this temp vc!",
							ephemeral: true,
						});
					if (newOwner.user.bot)
						return await interaction.reply({
							content: `Bots can't own temp vcs!`,
							ephemeral: true,
						});
					if (newOwner.voice.channelId !== member.voice.channelId)
						return await interaction.reply({
							content: `Provided user must be in the same voice channel as you!`,
							ephemeral: true,
						});
					let tempVc = tData.temps.find(
						(temp) => temp.vcId === member.voice.channelId
					);
					tempVc.ownerId = newOwner.id;
					await tempDb.findOneAndUpdate(
						{ guildId: guild.id, creatorsId: tData.creatorsId },
						{ $set: { temps: tData.temps } },
						{ upsert: true }
					);
					await member.voice.channel
						.permissionsFor(newOwner)
						.set({ Connect: true, Viewhannel: true })
						.catch((e) => {
							return interaction.reply({
								content: `Error: ${e.message}`,
								ephemeral: true,
							});
						});
					await interaction.reply({
						content: `Changed owner to ${newOwner.user.username}`,
					});
				}
				break;
			}
			case "help": {
				const embed = new EmbedBuilder()
					.setTitle("Tempy Commands")
					.setDescription(
						`
                        > **name:** Change the name of the temp vc (owner only)

                        > **limit:** Change the limit of the temp vc (owner only)

                        > **kick:** Kick a user from the temp vc (owner only)

						> **perm:** Change the permissions of the temp vc (owner only)

                        > **lock:** Lock or unlock the temp vc (owner only)

						> **hide:** Hide or unhide the temp vc (owner only)

                        > **owner:** Check or change the owner of the temp vc

                        > **claim:** Claim the temp vc if the owner is gone
                        `
					);
				return interaction.reply({
					embeds: [embed],
				});
				break;
			}
			case "claim": {
				let tempVc = tData.temps.find(
					(temp) => temp.vcId === member.voice.channelId
				);
				let currentOwner = guild.members.cache.get(tempVc.ownerId);
				if (
					currentOwner &&
					currentOwner.voice.channelId === tempVc.vcId
				) {
					return await interaction.reply({
						content: `owner ${currentOwner.user.username} is in this vc!`,
						ephemeral: true,
					});
				}
				await tempDb.findOneAndUpdate(
					{ guildId: guild.id, creatorsId: tData.creatorsId },
					{ $set: { temps: tData.temps } },
					{ upsert: true }
				);
				await interaction.reply({
					content: `New owner is ${member}!`,
				});
				break;
			}
			case "perm": {
				if (!isOwner)
					return await interaction.reply({
						content: "You are not the owner of this temp vc!",
						ephemeral: true,
					});
				const mem = options.getMember("allow-user");
				member.voice.channel.permissionOverwrites
					.edit(mem.user.id, { Connect: true, ViewChannel: true })
					.catch((e) => {
						return interaction.reply({
							content: `Error: ${e.message}`,
							ephemeral: true,
						});
					});
				await interaction.reply({
					content: ` ${mem} can join this vc!`,
				});
				break;
			}
			case 'hide' :{
				if (!isOwner)
					return await interaction.reply({
						content: "You are not the owner of this temp vc!",
						ephemeral: true,
					});
				const status = options.getBoolean('hide-status');
					await member.voice.channel
						.permissionOverwrites
						.edit(member.voice.channel.guild.roles.everyone, {
							ViewChannel: status ? false : null,
						})
						.catch((e) => {
							return interaction.reply({
								content: `Error: ${e.message}`,
								ephemeral: true,
							});
						});
					await interaction.reply({
						content: `Vc is now ${status ? 'hidden' : 'shown'}`,
					});
				break;
			}
		}
	},
};
