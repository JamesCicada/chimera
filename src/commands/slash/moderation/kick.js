const {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
} = require("discord.js");
const toHex = require("colornames");

module.exports = {
    category: 'moderation',
    usage: "kick [user] [reason?]",
    mod: true,
    structure: new SlashCommandBuilder()
        .setName("kick")
        .setDescription("kick a member from the guild").setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .addUserOption((option) => option.setName('user')
            .setDescription('the user that you wanna kick')
            .setRequired(true))
        .addStringOption((option) => option
            .setName('reason').setDescription('the reason why this member is getting kicked?').setRequired(false)
        ),

    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    run: async (client, interaction) => {
        try {
            let member = interaction.options.getMember('user')
            let user = interaction.options.getUser('user')
            let reason = interaction.options.getString('reason') || 'No reason was provided for this kick!'
            let bot = interaction.guild.members.cache.get(client.user.id)
            if (!member) return interaction.reply({
                content: `This user isn't a member of this server`,
                ephemeral: true,
            });
            if (member.id == interaction.guild.ownerId) return interaction.reply({
                content: `${member} owns the server so no one of us can kick them`,
                ephemeral: true,
            });
            if (member && bot.roles.highest.comparePositionTo(member.roles.highest) < 1) return interaction.reply({
                content: `${member} has a higher role than you or  therefor i cannot kick them`,
                ephemeral: true,
            });
            if (member && interaction.member.roles.highest.comparePositionTo(member.roles.highest) < 1 && interaction.member.id != interaction.guild.ownerId) return interaction.reply({
                content: `You can't kick ${member} because they have equal or higher role than yours`,
                ephemeral: true,
            });
            member.kick([`kicked by ${interaction.user.username}, ${reason}`]).then(() => {
                interaction.reply({
                    content: `${member.user.tag} (${member.user.id}) has been kicked`,
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
