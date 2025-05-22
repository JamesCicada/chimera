const {
	Client,
	EmbedBuilder,
	Guild,
	User,
	AuditLogEvent,
} = require("discord.js");
const { getResMem } = require("../../Functions/getResponsible");
const guildDb = require("../../schemas/guild");
const { log } = require("../../functions");
module.exports = {
	event: "guildCreate",
	/**
	 *
	 * @param {Client} client
	 * @param {Guild} guild
	 */
	run: async (client, guild) => {
		try {
			const inviter = (await getResMem(client, guild, "BotAdd")) || 'unk';
			let logsChannel = client.channels.cache.get("1190113670315909211");
			// if (botAddEntry) {
			await logsChannel.send({
				embeds: [
					new EmbedBuilder()
						.setAuthor({
							name: `${guild.name || "none"}`,
							iconURL: `${
								guild.iconURL() ||
								client.user.displayAvatarURL()
							}`,
						})
						.setTitle(`Joined a new guild`)
						.setDescription(
							`
                        > ID: ${guild.id}

                        > Name: ${guild.name}

                        > MemberCount: ${guild.memberCount}

                        > Owner: <@${guild.ownerId}> (${guild.ownerId})

                        > Inviter: ${inviter || "unk"} (${inviter.id || "unk"})
                        `
						)
						.setColor("Green"),
				],
			});
			console.log(executor);
			let sent = false;
			if (inviter) {
				await inviter
					.send({
						embeds: [
							new EmbedBuilder()
								.setAuthor({
									name: guild.name,
									iconURL:
										guild.iconURL() ||
										client.user.displayAvatarURL(),
								})
								.setTitle("Thank you for inviting me!")
								.setDescription(`
                        Hello **${inviter}**!
                        
                        Thank you for inviting me to **${
							guild.name || "your server"
						}** !. I'm here to assist you and provide helpful features.
                        
                        You can run /help to get a general overview of the available commands. Please make sure to grant me the necessary permissions to fulfill my purpose.
                        
                        If you have any questions or need assistance, feel free to ask!
                        
                        Best regards,
                        **${client.user.username}**
                        `),
						],
					})
					.catch((err) => {
						console.log(err);
					});
				sent = true;
			}
			// console.log(botAddEntry);
			// }
			// await logsChannel.send({
			//     embeds: [
			//         new EmbedBuilder().setAuthor({
			//             name: `${guild.name || 'none'}`,
			//             iconURL: `${guild.iconURL() || client.user.displayAvatarURL()}`
			//         }).setTitle(`Joined a new guild`).setDescription(
			//             `
			//         > ID: ${guild.id}

			//         > Name: ${guild.name}

			//         > MemberCount: ${guild.memberCount}

			//         > Owner: <@${guild.ownerId}> (${guild.ownerId})

			//         > Inviter: ${inviter || 'unk'} (${inviter.id || 'unk'})
			//         `
			//         ).setColor('Green')
			//     ]
			// }).catch((err) => {
			//     sendLogMessage('errors', 'Error logging guild join', err)
			// })
			let guildData = await guildDb.findOne({
				guildId: guild.id,
			});
			if (!guildData) {
				await guildDb
					.create({
						guildId: guild.id,
					})
					.then(() => {
						console.log(
							`added ${guild.name} (${guild.id}) to database`
						);
					});
			}

			let mainChannel =
				guild.channels.cache[1] ||
				guild.systemChannel ||
				guild.rulesChannel;
			if (sent) return;
			await mainChannel
				.send(
					`hello I assume that a moderator is going to see this message so you can use \`/help settings\` to setup the guild settings`
				)
				.catch((err) => {
					log(err, "err");
				});
		} catch (err) {}
	},
};
