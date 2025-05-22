const {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
} = require("discord.js");

module.exports = {
    category: 'moderation',
    usage: "unban [user] [reason]",
    structure: new SlashCommandBuilder()
        .setName("unban")
        .setDescription("revokes a user's ban from the guild")
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addUserOption((option) => option.setName('user')
            .setDescription('the user that you wanna ban')
            .setRequired(true))
        .addStringOption((option) => option
            .setName('reason').setDescription('the reason why this member is getting banned?').setRequired(false)
        ),

    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    run: async (client, interaction) => {
        try {
            let user = interaction.options.getUser('user')
            let reason = interaction.options.getString('reason') || 'The Hammer Ban has spoken!'
            interaction.guild.bans.remove(user, [`unbanned by ${interaction.user.username}, ${reason}`]).then(() => {
                interaction.reply(`${user.tag} (${user.id}) has been unbanned!`)
            })


        } catch (err) {
            interaction.reply({
                content: `There was an error please check my permissions`,
                ephemeral: true,
            });
            console.log(err);
        }
    },
};
