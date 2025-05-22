const {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
} = require("discord.js");
const toHex = require("colornames");

module.exports = {
    category: 'moderation',
    usage: "timeout [user/duration/reason]",
    mod: true,
    structure: new SlashCommandBuilder()
        .setName("timeout")
        .setDescription("timeout a member").setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption((option) => option.setName('user')
            .setDescription('the user that you wanna timeout')
            .setRequired(true)).addIntegerOption(
                (option) => option
                    .setName('duration').setDescription('duration of the timeout (minutes) leave empty to remove timeout to a member').setRequired(false).setMaxValue(10080)
            )
        .addStringOption((option) => option
            .setName('reason').setDescription('the reason why this member is getting timeouted?').setRequired(false)
        ),

    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    run: async (client, interaction) => {
        try {
            let member = interaction.options.getMember('user')
            let user = interaction.options.getUser('user')
            let reason = interaction.options.getString('reason') || 'The Hammer Ban has spoken!'
            let bot = interaction.guild.members.cache.get(client.user.id)
            let duration = interaction.options.getInteger('duration') ? interaction.options.getInteger('duration') * 1000 * 60 : null
            if (!member) return interaction.reply({
                content: `This user isn't a member of this server so you cannot timeout them`,
                ephemeral: true,
            });
            if (member.id == interaction.guild.ownerId) return interaction.reply({
                content: `This member owns the server so no one of us can timeout them`,
                ephemeral: true,
            });

            if (member && member.roles.highest.comparePositionTo(bot.roles.highest) > 0) return interaction.reply({
                content: `This member has a higher role than me therefor i cannot timeout them`,
                ephemeral: true,
            });
            if (member && member.roles.highest.comparePositionTo(interaction.member.roles.highest) > 0 && interaction.member.id != interaction.guild.ownerId) return interaction.reply({
                content: `This member has a higher role than you therefor you cannot timeout them`,
                ephemeral: true,
            });
            if (member && member.permissions.has(PermissionFlagsBits.Administrator)) return interaction.reply({
                content: `This member has admin perms so they can't be timeouted`,
                ephemeral: true,
            });
            member.timeout(duration, `${duration ? 'timeouted for ' + duration : 'untimeouted'} by ${interaction.user.username}, ${reason}`).then(() => {
                interaction.reply({
                    content: `${member.user.tag} (${member.user.id}) has been ${duration ? 'timeouted for ' + duration / 1000 / 60 + ' minutes' : 'untimeouted'}`,
                });
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
