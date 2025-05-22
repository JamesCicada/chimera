const {
	ChatInputCommandInteraction,
	SlashCommandBuilder,
	EmbedBuilder,
	PermissionFlagsBits,
	ChannelType,
	Channel,
	Webhook,
	ActionRowBuilder,
	ButtonBuilder,
	Client,
} = require("discord.js");
const logsDb = require("../../../schemas/logs");
const { sendLogs } = require("../../../Functions/actionLogs");
module.exports = {
	structure: {
		name: "auditlogs",
		description: "Manage audit logs!",
		aliases: ["alogs", "logging"],
		cooldown: 15000,
	},
	/**
	 * @param {Client} client
	 * @param {Message<true>} message
	 * @param {string[]} args
	 */
	run: async (client, message, args) => {
		try {
			if (
				!message.member.permissions.has(
					PermissionFlagsBits.Administrator
				)
			) {
				return message.reply(
					`You don't have perms to use this command!`
				);
			}
			const interaction = message;
			const subCommand = args[0];
			const logTypes = [
				"join",
				"leave",
				"voice",
				"kick",
				"ban",
				"timeout",
				"channels",
				"roles",
				"guild",
				"messages",
			];
			if (
				!interaction.guild.members.me.permissions.has(
					PermissionFlagsBits.ManageChannels
				)
			)
				return interaction.reply({
					content: `I don't have perms to create/manage channels`,
					ephemeral: true,
				});
			let guildDb = await logsDb.findOne({
				guildId: interaction.guild.id,
			});
			if (!guildDb) {
				await logsDb.create({
					guildId: interaction.guild.id,
				});
				console.log("created logs DB for ", interaction.guild.name);
			}

			guildDb = await logsDb.findOne({
				guildId: interaction.guild.id,
			});
			switch (subCommand) {
				case "generate":
					{
						try {
							interaction
								.reply({
									content: `<a:chimera_loading:1189609175840460961> Creating log channels...`,
								})
								.then(async (msg) => {
									let working = 0;
									let broken = 0;
									let logsStatus = guildDb.logStatus;

									for await (const log of logTypes) {
										let hookUrl =
											guildDb.logChannels[`${log}`];
										let whook = (
											await interaction.guild.fetchWebhooks()
										).find((w) => w.url == hookUrl);
										if (!whook) {
											broken++;
										} else {
											working++;
										}
									}
									console.log(working);
									if (working > 0)
										return await msg.edit({
											embeds: [],
											content: `This server already has logs run \`/auditlogs check\` to fix them`,
											ephemeral: true,
										});
									const logsCat =
										await interaction.guild.channels.create(
											{
												name: "Chimera AuditLogs",
												type: ChannelType.GuildCategory,
												reason: `Logs setup initialized by ${interaction.member.id} (${interaction.member.displayName})`,
												permissionOverwrites: [
													{
														id: interaction.guild
															.id,
														deny: [
															PermissionFlagsBits.ViewChannel,
														],
													},
												],
											}
										);
									let channels = [];
									for (const log of logTypes) {
										await interaction.guild.channels
											.create({
												parent: logsCat.id,
												name: `${log}-logs`,
												reason: `Logs setup initialized by ${interaction.member.id} (${interaction.member.displayName})`,
												type: ChannelType.GuildText,
											})
											.then((ch) => {
												channels.push(ch);
											});
									}
									await msg.edit({
										content: `<a:chimera_loading:1189609175840460961> Creating Webhooks...`,
									});
									const updates = {};

									for await (const t of channels) {
										let n = t.name.replace("-logs", "");
										const whook = await createLogsWebhook(
											n,
											t
										);
										updates[`logChannels.${n}`] =
											await whook.url;
										updates[`logStatus.${n}`] = true;
									}
									// console.log(updates);
									await guildDb
										.updateOne({ $set: updates })
										.catch((err) => {
											console.log(err);
										});

									guildDb = await logsDb.findOne({
										guildId: interaction.guild.id,
									});

									await msg.edit({
										content: "",
										embeds: [
											new EmbedBuilder().setTitle(
												"List of all Logs Channels"
											).setDescription(`
                        ${channels
							.map(
								(ch) =>
									`> ${ch.name.replace("-logs", "")}: <#${
										ch.id
									}>\n`
							)
							.join("\n")}
                        `),
										],
									});
									await sendLogs(interaction.guild, "auditlogs", {
										description: `${message.member} generated audit logs.`,
										color: "Aqua",
										avatarURL: message.author.displayAvatarURL() || client.user.displayAvatarURL(),
										username: message.author.username,
									});
								})
								.catch((err) => {
									console.log(err);
								});
						} catch (err) {
							console.log(err);
						}
					}
					break;
				case "manage":
					{
						let logsStatus = guildDb.logStatus;

						if (!logsStatus) {
							return interaction.reply({
								content:
									"No logs found in the database. Generate logs first.",
								ephemeral: true,
							});
						}

						const embed = new EmbedBuilder()
							.setTitle("Manage Logs Channels")
							.setDescription(
								"Click the buttons to turn logs On/Off"
							)
							.setColor("Blue");

						let buttons = [];
						let description = "";

						for (const log of logTypes) {
							const logStatus = logsStatus[log];
							const buttonText = `${
								logStatus ? "DISABLE" : "ENABLE"
							} ${log.toUpperCase()}`;
							const buttonStyle = logStatus ? 3 : 2; // 2 for DANGER (red) if log is On, 1 for PRIMARY (blue) if log is Off

							buttons.push(
								new ButtonBuilder()
									.setCustomId(`toggle_log_${log}`)
									.setLabel(buttonText)
									.setStyle(buttonStyle)
							);

							description += `> **${capitalize(log)} Logs**: ${
								logStatus
									? "<:chimera_switchon:1189609942567616512> `On`"
									: "<:chimera_switchoff:1189610234587664534> `Off`"
							}\n\n`;
						}
						if (logsStatus.length <= 0)
							return interaction.reply({
								content: `This server doesn't have logs active Please run </auditlogs generate:${
									client.commands
										.find(
											(com) =>
												com.data.name === "auditlogs"
										)
										.subCommands.find(
											(sb) => sb.data.name == "generate"
										).id
								}>`,
								ephemeral: true,
							});
						embed.setFooter({
							text: "Log status updates may take a moment to reflect Please do not spam the buttons.",
						});
						embed.setDescription(description);
						let allButtons = [];
						const MAX_BUTTONS_PER_ROW = 5;
						for (
							let i = 0;
							i < buttons.length;
							i += MAX_BUTTONS_PER_ROW
						) {
							const rowButtons = buttons.slice(
								i,
								i + MAX_BUTTONS_PER_ROW
							);
							allButtons.push(
								new ActionRowBuilder().addComponents(
									...rowButtons
								)
							);
						}

						interaction
							.reply({
								embeds: [embed],
								components: allButtons,
							})
							.then(async (msg) => {
								const collector =
									interaction.channel.createMessageComponentCollector(
										{
											time: 60000,
										}
									);

								collector.on(
									"collect",
									async (buttonInteraction) => {
										if (
											buttonInteraction.member.id !==
											interaction.member.id
										)
											return buttonInteraction.deferUpdate();
										const logName =
											buttonInteraction.customId.replace(
												"toggle_log_",
												""
											);
										if (logsStatus[logName] !== undefined) {
											logsStatus[logName] =
												!logsStatus[logName];

											await guildDb.updateOne({
												[`logStatus.${logName}`]:
													logsStatus[logName],
											});
											guildDb = await logsDb.findOne({
												guildId: interaction.guild.id,
											});
											logsStatus = guildDb.logStatus;
											buttons = [];
											description = "";
											for (const log of logTypes) {
												const logStatus =
													logsStatus[log];
												const buttonText = `${
													logStatus
														? "DISABLE"
														: "ENABLE"
												} ${log.toUpperCase()}`;
												const buttonStyle = logStatus
													? 3
													: 2; // 2 for DANGER (red) if log is On, 1 for PRIMARY (blue) if log is Off

												buttons.push(
													new ButtonBuilder()
														.setCustomId(
															`toggle_log_${log}`
														)
														.setLabel(buttonText)
														.setStyle(buttonStyle)
												);

												description += `> **${capitalize(
													log
												)} Logs**: ${
													logStatus
														? "<:chimera_switchon:1189609942567616512> `On`"
														: "<:chimera_switchoff:1189610234587664534> `Off`"
												}\n\n`;
											}

											embed.setDescription(description);
											allButtons = [];
											for (
												let i = 0;
												i < buttons.length;
												i += MAX_BUTTONS_PER_ROW
											) {
												const rowButtons =
													buttons.slice(
														i,
														i + MAX_BUTTONS_PER_ROW
													);
												allButtons.push(
													new ActionRowBuilder().addComponents(
														...rowButtons
													)
												);
											}
											await buttonInteraction.update({
												embeds: [embed],
												components: allButtons,
											});
											await sendLogs(interaction.guild, "auditlogs", {
												description: `${message.member} Edited audit logs.`,
												color: "Aqua",
												avatarURL: message.author.displayAvatarURL() || client.user.displayAvatarURL(),
												username: message.author.username,
											});
										}
									}
								);

								collector.on("end", () => {
									const disabledButtons = buttons.map(
										(button) => button.setDisabled()
									);
									const disabledRow =
										new ActionRowBuilder().addComponents(
											...disabledButtons
										);
									msg.edit({
										embeds: [
											new EmbedBuilder()
												.setDescription(
													"Time is up. Run the command again to keep editing!"
												)
												.setColor("Red"),
										],
										components: [],
									});
									setTimeout(() => {
										msg.delete();
									}, 1000 * 15);
								});
							});
					}
					break;
				case "check":
					{
						let linksStatus = {};
						let brokens = 0;
						let parentCategory = null;
						if (
							!guildDb.logChannels.ban &&
							!guildDb.logChannels.roles &&
							!guildDb.logChannels.channels
						)
							return interaction.reply({
								embeds: [],
								content: `This server doesn't have logs active Please run </auditlogs generate:${
									client.application.commands.cache.find(
										(c) => c.name == this.data.name
									)?.id
								}>`,
								ephemeral: true,
							});
						await interaction
							.reply({
								embeds: [
									new EmbedBuilder().setTitle(
										"<a:chimera_loading:1189609175840460961> Checking Logs Channels/Webhooks"
									),
								],
							})
							.then(async (msg) => {
								for await (const log of logTypes) {
									let hookUrl = guildDb.logChannels[`${log}`];
									let whook = (
										await interaction.guild.fetchWebhooks()
									).find((w) => w.url == hookUrl);
									if (!whook) {
										linksStatus[`${log}`] = false;
										brokens++;
									} else {
										linksStatus[
											`<#${whook.channelId}>`
										] = true;
										if (!parentCategory) {
											const channel =
												interaction.guild.channels.cache.get(
													whook.channelId
												);
											if (channel.parent) {
												parentCategory = channel.parent;
											}
										}
									}
								}

								const description = Object.keys(linksStatus)
									.map((log) => {
										return `> ${log} ${
											linksStatus[log]
												? "Working ✅"
												: "Broken ❌"
										}\n\n`;
									})
									.join("");

								const embed = new EmbedBuilder()
									.setDescription(
										`> Logs Channels Status:\n\n${description}`
									)
									.setColor("Random");
								if (brokens > 0) {
									const fixButton =
										new ActionRowBuilder().addComponents(
											new ButtonBuilder()
												.setCustomId("fix_logs")
												.setLabel(
													`Fix ${brokens} Broken Logs`
												)
												.setStyle(3)
												.setEmoji("🔧")
										);

									embed.setFooter({
										text: `Click the button to fix ${brokens} broken logs`,
									});

									await msg.edit({
										embeds: [embed],
										components: [fixButton],
									});

									const collector =
										interaction.channel.createMessageComponentCollector(
											{
												time: 60000,
											}
										);

									collector.on(
										"collect",
										async (buttonInteraction) => {
											if (
												buttonInteraction.customId ===
													"fix_logs" &&
												buttonInteraction.member.id ===
													interaction.member.id
											) {
												for (const log of logTypes) {
													if (
														linksStatus[log] ===
														false
													) {
														if (parentCategory) {
															await interaction.guild.channels
																.create({
																	parent: parentCategory.id,
																	name: `${log}-logs`,
																	reason: `Logs fix initialized by ${interaction.member.id} (${interaction.member.displayName})`,
																})
																.then(
																	async (
																		newChannel
																	) => {
																		// Create a webhook for the new channel
																		const webhook =
																			await createLogsWebhook(
																				log,
																				newChannel
																			);
																		// Update the database with the new webhook URL
																		await guildDb.updateOne(
																			{
																				[`logChannels.${log}`]:
																					webhook.url,
																				[`logStatus.${log}`]: true,
																			}
																		);
																	}
																);
														}
													}
												}
												linksStatus = {};
												for await (const log of logTypes) {
													let hookUrl =
														guildDb.logChannels[
															`${log}`
														];
													let whook = (
														await interaction.guild.fetchWebhooks()
													).find(
														(w) => w.url == hookUrl
													);
													if (!whook) {
														linksStatus[
															`${log}`
														] = false;
														brokens++;
													} else {
														linksStatus[
															`<#${whook.channelId}>`
														] = true;
														if (!parentCategory) {
															const channel =
																interaction.guild.channels.cache.get(
																	whook.channelId
																);
															if (
																channel.parent
															) {
																parentCategory =
																	channel.parent;
															}
														}
													}
												}
												// Update the embed to reflect the fixed status
												const fixedDescription =
													Object.keys(linksStatus)
														.map((log) => {
															return `> ${log} ${
																linksStatus[log]
																	? "Working ✅"
																	: "Fixed and Working ✅"
															}\n\n`;
														})
														.join("");

												const fixedEmbed =
													new EmbedBuilder()
														.setDescription(
															`> Logs Channels Status:\n\n${fixedDescription}`
														)
														.setColor("Green"); // Change color to indicate that logs are fixed
												buttonInteraction.deferUpdate();
												await buttonInteraction.message.edit(
													{
														embeds: [fixedEmbed],
														components: [], // Remove the button
													}
												);
											}
										}
									);

									collector.on("end", () => {
										// Cleanup after the collector ends (optional)
									});
								} else {
									await msg.edit({
										embeds: [embed],
									});
								}
							});
					}
					break;
			}

			/**
			 *
			 * @param {Channel} channel
			 * @param {Webhook} webhook
			 */
			async function createLogsWebhook(name, channel) {
				const ret = await channel.createWebhook({
					name: `Chimera ${name.replace("-logs", "")} Logs`,
					avatar: client.user.displayAvatarURL(),
					reason: `Logs for ${name} by ${interaction.member.id} (${interaction.member.displayName})`,
				});
				return ret;
			}
		} catch (err) {
			interaction.reply({
				content: `There was an error please check my permissions`,
				ephemeral: true,
			});
			console.log(err);
		}
	},
};
function capitalize(str) {
	if (typeof str !== "string" || str.length === 0) {
		return str;
	}

	return str.charAt(0).toUpperCase() + str.slice(1);
}
