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
			let tData = await tempDb.findOne({
				guildId: oldState.guild.id,
				creatorsId: newState.channel?.id,
			});
			if (!tData) return;
			if (newState.member.user.bot) return;
			let mData = await memData.findOne({
				memberId: newState.member.id,
				guildId: newState.guild.id,
			});
			if (!mData)
				return memData.create({
					memberId: newState.member.id,
					guildId: newState.guild.id,
				});
			mData = await memData.findOne({
				memberId: newState.member.id,
				guildId: newState.guild.id,
			});
			let isCreatorCat = tData && tData.cat == newState.channel.parentId;
			if (isCreatorCat) {
				if (!tData || !tData.status) return;
				let cd = mData.tempCooldown.find(
					(t) => t.creatorId == newState.channel.id
				);
				let endsAt = cd && cd.endsAt;
				let isDmsCooldown = client.collection.dmsCooldown.get(
					`${newState.member.id}-${tData.creatorsId}`
				);
				console.log(isDmsCooldown);
				if (cd) {
					if (Math.round(Date.now()) < endsAt) {
						if (isDmsCooldown)
							return newState.member.voice.disconnect([
								"On Cooldown",
							]);
						await newState.member
							.send({
								content: `You are on cooldown in <#${
									newState.channel.id
								}> you can create vcs again <t:${Math.round(
									endsAt / 1000
								)}:R>.`,
							})
							.then((msg) => {
								client.collection.dmsCooldown.set(
									`${newState.member.id}-${tData.creatorsId}`
								);
								setTimeout(() => {
									msg.delete();
									client.collection.dmsCooldown.delete(
										`${newState.member.id}-${tData.creatorsId}`
									);
								}, 30 * 1000);
							});
						newState.member.voice.disconnect(["On Cooldown"]);
						return;
					} else {
						mData.tempCooldown.pull(cd);
					}
				}
				const { guild, member, channel } = newState;
				const parent = channel.parent;
				let name = "";
				if (tData.naming == "owner") {
					name = `${member.displayName}'s temp`;
				} else if (tData.naming == "custom") {
					name = `${tData.customNaming.replace(
						"{n}",
						parent.children.cache.filter(
							(ch) => ch.type == ChannelType.GuildVoice
						).size
					)}`;
				} else if (tData.naming == "follow") {
					name = `${channel.name} - ${member.displayName}`;
				}
				let newVc = await guild.channels.create({
					name: name || `${member.displayName}'s temp`,
					type: 2,
					parent: parent,
					permissionOverwrites: [
						{
							id: member.id,
							allow: ["ViewChannel", "SendMessages"],
						},
					],
					reason: "Chimera Temp Channel",
				});
				member.voice.setChannel(newVc, ["Created Temp Channel"]);
				if (tData.cooldown) {
					let coolDown = new duration(tData.cooldown)._milliseconds;
					mData.tempCooldown.push({
						creatorId: tData.creatorsId,
						endsAt: Math.floor(Date.now()) + coolDown,
					});
					mData.save();
				}
				await tData.updateOne({
					$push: {
						temps: {
							vcId: newVc.id,
							ownerId: member.id,
							rejected: [],
						},
					},
				});
				await newVc.send({
					content: `<@${member.id}> this is your temp channel`,
				});
			}
		} catch (error) {
			console.log(error);
		}
	},
};
