const {
	ActivityType,
	Client,
	EmbedBuilder,
	GuildMember,
	WebhookClient,
	VoiceState,
	ChannelType,
} = require("discord.js");
const tempDb = require("../../schemas/tempvc");
const memData = require("../../schemas/member");
const duration = require("duration-js");
const moment = require("moment");
module.exports = {
	event: "voiceStateUpdate",
	/**
	 *
	 * @param {VoiceState} oldState
	 * @param {VoiceState} newState
	 * @param {Client} client
	 */
	run: async (client, oldState, newState) => {
		try {
			if (oldState.channel) {
				let tData = await tempDb.findOne({
					guildId: oldState.guild.id,
					cat: oldState.channel.parentId,
				});
				if (!tData) return;
				let isCreatorCat = tData.cat == oldState.channel.parentId;
				if (isCreatorCat) {
					if (oldState.channel.id !== tData.creatorsId) {
						if (oldState.channel.members.size == 0) {
							await tData.updateOne({
								$pull: {
									temps: {
										vcId: oldState.channel.id,
									},
								},
							});
							await oldState.guild.channels.delete(
								oldState.channel.id,
								"VC is empty"
							);
						}
					}
				}
			}
		} catch (error) {
			console.log(error);
		}
	},
};
