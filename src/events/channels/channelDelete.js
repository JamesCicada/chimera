const {
	Client,
	EmbedBuilder,
	WebhookClient,
	Channel,
    Permissions,
    PermissionsBitField,
	ChannelType
} = require("discord.js");
const logsDb = require("../../schemas/logs");

module.exports = {
	event: "channelDelete",
	/**
	 *
	 * @param {Client} client
	 * @param {Channel} oldChannel
	 */
	run: async (client, oldChannel) => {
		try {
			// if (!oldChannel.isText() && !oldChannel.isVoice() && !oldChannel.isCateg) return;
			const guildDb = await logsDb.findOne({
				guildId: oldChannel.guild.id
			});
			if (!oldChannel.guild) return;
			if (
				!guildDb ||
				!guildDb.logStatus.channels ||
				!guildDb.logChannels.channels
			)
				return;
			// console.log('yes');
			const whook = new WebhookClient({
				url: guildDb.logChannels.channels,
			});

			if (!whook) return;
            let AuditLogFetch = await oldChannel.guild.fetchAuditLogs({limit: 10, type: 12})

            if (!AuditLogFetch.entries.first()) return console.error(`No entries found.`);
    
            const Entry = AuditLogFetch.entries.first();

			const embed = new EmbedBuilder()
				.setColor('Red')
				.setTitle("Channel Deleted")
				.setDescription(`
                > Channel: ${oldChannel.name} (${oldChannel.id})

				> Type: **${ChannelType[oldChannel.type].replace('Guild', '')}**

                > Moderator: ${`${Entry.executor} (${Entry.executor.id})` || "Unknown"}
                `)
				.setTimestamp();
			await whook.send({ embeds: [embed] });
		} catch (error) {
			console.log(error);
		}
	},
};
