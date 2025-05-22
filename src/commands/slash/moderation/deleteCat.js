const {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
    ChannelType
} = require("discord.js");
module.exports = {
    category: 'moderation',
    usage: "deletecat [category]",
    owner: true,
    mod: true,
    structure: new SlashCommandBuilder()
        .setName("deletecat")
        .setDescription("Deletes a category with its channels")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption((options) => options.setName('category').setDescription('category to delete (with it\'s channels)').setRequired(true).addChannelTypes(ChannelType.GuildCategory))
        ,

    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    run: async (client, interaction) => {
        try {
            if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels)) return interaction.reply({
                content: `I don't have perms to create/manage channels`,
                ephemeral: true,
            });
            
            const cat = interaction.options.getChannel('category')
            let channels = cat.children.cache
            channels.each(async (ch)=>{
                await ch.delete([`Deleted by ${interaction.member.id} (${interaction.member.displayName}`])
            })
            await cat.delete([`Deleted by ${interaction.member.id} (${interaction.member.displayName}`])
            await interaction.reply({
                content: `Deleted ${channels.size + 1}`,
            });
        } catch (err) {
            interaction.reply({
                content: `There was an error please check my permissions`,
                ephemeral: true,
            });
            console.log(err);
        }
    },
};