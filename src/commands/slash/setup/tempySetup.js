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
const GuildSchema = require("../../../schemas/guild");

module.exports = {
  category: 'setup',
  usage: "setup-tempy [on/off/delete]",
	structure: new SlashCommandBuilder()
		.setName("setup-tempy")
		.setDescription("Setup a new tempy creator")
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.addStringOption((option) =>
			option
				.setName("tempy-status")
				.setDescription("switch tempy to on, off or delete")
                .addChoices(
                    { name: "On", value: "on" },
                    { name: "Off", value: "off" },
                    { name: "Delete", value: "delete" }
                )
				.setRequired(true)
		)
        .addChannelOption((option) =>
            option
                .setName("channel")
                .setDescription("set a custom channel (if not provided it will be created)")
                .setRequired(false)
                .addChannelTypes(ChannelType.GuildVoice)
        )
		.addStringOption((option) =>
			option
				.setName("naming")
				.setDescription("set a custom naming")
				.addChoices(
					{ name: "Follow Creator Vc", value: "follow" },
					{ name: "Owner Name", value: "owner" },
					{ name: "Custom", value: "custom" }
				)
				.setRequired(false)
		).addStringOption((option) =>
            option
                .setName("custom-naming")
                .setDescription("set a custom naming use {n} to use number")
                .setRequired(false)
        ).addStringOption((option) =>
            option
                .setName("cooldown")
                .setDescription("set a custom cooldown ex: 10m, 10h, 10d")
                .setRequired(false)
        )
        ,

	options: {
		cooldown: 15000,
	},
	/**
	 * @param {ExtendedClient} client
	 * @param {ChatInputCommandInteraction} interaction
	 */
	run: async (client, interaction) => {
        await interaction.reply({ content: "Loading...", ephemeral: true })
        const { guild, options, user, channel } = interaction;
        let status = options.getString("tempy-status");
        let gData = await GuildSchema.findOne({ guild: guild.id });
        if (!gData) {
            await GuildSchema.create({ guild: guild.id });
            gData = await GuildSchema.findOne({ guild: guild.id });
        }
        console.log(status);
        const ch = options.getChannel("channel");
        let tData = await tempDb.findOne({ guildId: guild.id, creatorsId: ch?.id });
        if (!tData) {
            await tempDb.create({ guildId: guild.id, creatorsId: ch?.id });
            tData = await tempDb.findOne({ guildId: guild.id, creatorsId: ch?.id });
        } else if (tData && status !== "delete") {
            return await interaction.editReply({
                content: "This channel is already used in tempy!",
                ephemeral: true
            })
        }
        const naming = options.getString("naming");
        const customNaming = options.getString("custom-naming");
        const cooldown = options.getString("cooldown") || '0m';
        if(status == "off" && !ch) return await interaction.editReply({
            content: "Please provide a channel to turn off tempy!",
            ephemeral: true
        })
        if(status == "delete") {
            await tData.deleteOne();
            return await interaction.editReply({
                content: "Tempy has been deleted!",
                ephemeral: true
            })
        }
        status = status == 'on' ? true : false
        let cooldownDuration = new duration(cooldown)
        let max = new duration('24h')
        if(cooldownDuration > max) return await interaction.editReply({
            content: "Please provide a valid cooldown! ex: 10m, 5h. Max is 24h!",
            ephemeral: true
        })
        let newCh = ch;
        if(!ch) {
            let cat = await guild.channels.create({
                name: `${customNaming ? customNaming : 'Chimera Tempy'}`,
                type: ChannelType.GuildCategory,
                reason: `Tempy Setup By ${user.username}`
            })
            newCh = await guild.channels.create({
                name: `${customNaming ? customNaming : 'Chimera Tempy'}`,
                parent: cat.id,
                reason: `Tempy Setup By ${user.username}`,
                type: ChannelType.GuildVoice
            })
        }
        tData.status = status;
        tData.creatorsId = newCh.id;
        tData.naming = naming;
        tData.customNaming = customNaming;
        tData.cooldown = cooldownDuration;
        tData.cat = newCh.parentId;
        await tData.save();
        return await interaction.editReply({ content: `Tempy is now ${status ? 'on' : 'off'} in ${newCh}`, ephemeral: true })
    },
};
