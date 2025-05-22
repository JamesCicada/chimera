const {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    EmbedBuilder,
} = require("discord.js");
module.exports = {
    category: 'utility',
    usage: "avatar [user]",
    structure: new SlashCommandBuilder()
        .setName("avatar")
        .setDescription("Get the avatar of a member")
        .addUserOption((option) =>
            option
                .setName("user")
                .setDescription("The member to get the avatar of")
                .setRequired(false)
        ),
    /**
     *
     * @param {ChatInputCommandInteraction} interaction
     */
    run: async (client, interaction) => {
        let targetUser = interaction.options.getUser("user") || interaction.user;
        let targetMember = interaction.options.getMember("user") || interaction.member;

        let avatar = targetMember.displayAvatarURL({ dynamic: true, size: 4096 }) || targetUser.displayAvatarURL({ dynamic: true, size: 4096 });
        let embed = new EmbedBuilder()
            .setTitle(`${targetUser.username}'s avatar`)
            .setImage(avatar)
            .setFooter({
                text: `Requested by ${interaction.author ? interaction.author.username : interaction.user.username}`,
                IconURL: interaction.author? interaction.author.displayAvatarURL({
                    dynamic: true,
                    size: 4096,
                }) : interaction.user.displayAvatarURL({
                    dynamic: true,
                    size: 4096,
                }),
            })
            .setColor("Random");
        try {
            interaction.reply({ embeds: [embed] });
        } catch (error) {
            interaction.reply({
                content: `There was an error please check my permissions`,
                ephemeral: true,
            });
            console.log(error);
        }
    },
};
