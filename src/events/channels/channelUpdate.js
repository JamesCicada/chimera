const {
	Client,
	EmbedBuilder,
	WebhookClient,
	Channel,
    Permissions,
    PermissionsBitField
} = require("discord.js");
const logsDb = require("../../schemas/logs");

module.exports = {
	event: "channelUpdate",
	/**
	 *
	 * @param {Client} client
	 * @param {Channel} oldChannel
	 * @param {Channel} newChannel
	 */
	run: async (client, oldChannel, newChannel) => {
		try {
			// if (!oldChannel.isText() && !oldChannel.isVoice() && !oldChannel.isCateg) return;
			const guildDb = await logsDb.findOne({
				guildId: oldChannel.guild.id || newChannel.guild.id,
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
            const actions = [10,12,13,15,14,11]
            const auditLogEvents = ['ChannelCreate','ChannelDelete','ChannelOverwriteCreate','ChannelOverwriteDelete','ChannelOverwriteUpdate','ChannelUpdate'];
            let AuditLogFetch = await newChannel.guild.fetchAuditLogs({limit: 10})

            AuditLogFetch = AuditLogFetch.entries.filter((en) => actions.includes(en.action))
            if (!AuditLogFetch.first()) return console.error(`No entries found.`);
    
            const Entry = AuditLogFetch.first();
            let changes;
            changes = await getChanges(Entry.extra?.id)
            console.log(changes);
            const isMember = oldChannel.guild.members.cache.get(Entry.extra?.id) ? true : false
            const mappedChanges = changes && changes !== 'An error occurred while comparing overwrites.' ? changes.map(([permissionType, values]) => {
                return `- ${permissionType}: \`${values['oldValue'] ? '✅' : '❌' || '⬜'}\` ==> \`${values['newValue'] ? '✅' : '❌' || '⬜'}\`\n`;
              }) : null;
            const formattedChanges = mappedChanges && mappedChanges.join('')
			const embed = new EmbedBuilder()
				.setColor('Blurple')
				.setTitle("Channel Updated")
				.setDescription(`
                > Channel: ${newChannel} (${newChannel.id})
                ${Entry.extra ? `\n> Target: Type: ${isMember ? `Member: <@${Entry?.extra.id}> (${Entry?.extra.id})\n` : `Role: <@&${Entry?.extra.id}> (${Entry?.extra.id})\n`}` : ''}
                > Action: ${ auditLogEvents[actions.indexOf(Entry.action)]}

                > Moderator: ${`${Entry.executor} (${Entry.executor.id})` || "Unknown"}

                ${formattedChanges ? `> Changes: \n${formattedChanges}` : ''}
                `)
				.setTimestamp();

			if (oldChannel.name != newChannel.name) {
				embed.addFields(
					{ name: "Old Channel Name:", value: `${oldChannel.name}` },
					{ name: "New Channel Name:", value: `${newChannel.name}` }
				);
			}
            if (oldChannel.userLimit != newChannel.userLimit) {
				embed.addFields(
					{ name: "Old Channel Limit:", value: `${oldChannel.userLimit == 0 ? '♾️' : oldChannel.userLimit}` },
					{ name: "New Channel Limit:", value: `${newChannel.userLimit == 0 ? '♾️' : newChannel.userLimit}` }
				);
			}

			await whook.send({ embeds: [embed] });
			async function getChanges(targetId) {
                try {
                  const oldOverwrites = oldChannel.permissionsFor(targetId);
                  const newOverwrites = newChannel.permissionsFor(targetId);
                //   if (!oldOverwrites || !newOverwrites) {
                //     return "One or both channels do not have overwrites for the target.";
                //   }
                  const changes = {};
                  for (const permissionType of [
                    'ViewChannel',
                    'ManageChannels',
                    'SendMessages',
                    'SendTTSMessages',
                    'ManageMessages',
                    'EmbedLinks',
                    'AttachFiles',
                    'ReadMessageHistory',
                    'MentionEveryone',
                    'UseExternalEmojis',
                    'AddReactions',
                    'Connect',
                    'Speak',
                    'Stream',
                    'UseVAD',
                    'PrioritySpeaker',
                    'MuteMembers',
                    'DeafenMembers',
                    'MoveMembers',
                    'UseApplicationCommands',
                    'RequestToSpeak',
                    'ManageEvents',
                    'ManageThreads',
                    'CreatePublicThreads',
                    'CreatePrivateThreads',
                    'UseExternalStickers',
                    'SendMessagesInThreads'
                  ]) {
                    if (oldOverwrites.has(permissionType) !== newOverwrites.has(permissionType)) {
                      changes[permissionType] = {
                        oldValue: oldOverwrites.has(permissionType),
                        newValue: newOverwrites.has(permissionType),
                      };
                    }
                  }
              
                  return Object.entries(changes);
                } catch (error) {
                //   console.error("Error retrieving or comparing overwrites:", error);
                  return "An error occurred while comparing overwrites.";
                }
              }
		} catch (error) {
			console.log(error);
		}
	},
};
