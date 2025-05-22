const {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
} = require("discord.js");
const toHex = require("colornames");

module.exports = {
    category: 'moderation',
    usage: "ban [user] [reason?]",
    mod: true,
    structure: new SlashCommandBuilder()
        .setName("ban")
        .setDescription("Ban a member from the guild").setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
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
            let member = interaction.options.getMember('user')
            let user = interaction.options.getUser('user')
            let reason = interaction.options.getString('reason') || 'The Hammer Ban has spoken!'
            let bot = interaction.guild.members.cache.get(client.user.id)
            if (member && member.id == interaction.guild.ownerId) return interaction.reply({
                content: `${member} owns the server so no one of us can ban them`,
                ephemeral: true,
            });
            if (member && bot.roles.highest.comparePositionTo(member.roles.highest) < 1) return interaction.reply({
                content: `${member} has a higher role than you therefor i cannot ban them`,
                ephemeral: true,
            });
            if (member && interaction.member.roles.highest.comparePositionTo(member.roles.highest) < 1 && interaction.member.id != interaction.guild.ownerId) return interaction.reply({
                content: `You can't ban ${member} because they have equal or higher role than yours`,
                ephemeral: true,
            });
            interaction.guild.bans.create(user, {
                reason: `banned by ${interaction.user.username}, ${reason}`
            }).then(() => {
                interaction.reply(`${user.tag} (${user.id}) has been banned!`)
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
