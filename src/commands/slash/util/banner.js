const {
    interaction,
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    EmbedBuilder,
} = require("discord.js");
const randomColor = require("randomcolor");

module.exports = {
    category: 'utility',
    usage: "banner [user]",
    structure: new SlashCommandBuilder()
        .setName("banner")
        .setDescription("Get banner of a member")
        .addUserOption((option) =>
            option
                .setName("user")
                .setDescription("The member to get banner of")
                .setRequired(false)
        ),
    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    run: async (client, interaction) => {
        //let ganyu = client.emojis.cache.get("1025758465085411429");
        let targetUser =
            interaction.options.getUser("user") || interaction.user;
        let targetMember =
            interaction.options.getMember("user") || interaction.member;
        let userForce = await client.users.fetch(targetMember, {
            force: true,
        });
        let banner = userForce.bannerURL({ size: 1024, dynamic: true });
        let embed = {
            title: `${targetUser.tag}'s banner`,
            thumbnail: { url: targetMember.user.displayAvatarURL() },
            color: parseInt(randomColor().replace("#", "0x"), 16),
            image: {
                url: banner,
            },
            footer: {
                text: `Requested by ${interaction.user.tag}`,
                icon_url: interaction.user.displayAvatarURL(),
            },
        };
        try {
            if (banner) {
                interaction.deferReply().then(() => {
                    sleep(150)
                    interaction.editReply({
                        embeds: [embed],
                    })
                })
            } else {
                await interaction.reply({
                    content: "`user has no Banner`",
                    ephemeral: true,
                });
            }
            function sleep(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
            }
        } catch (err) {
            console.log(err);
            interaction.reply({
                content: `There was an error please check my permissions`,
                ephemeral: true,
            });
        }
    },
};
