const {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
} = require("discord.js");
const toHex = require("colornames");

module.exports = {
    category: 'utility',
    usage: "send [title/description/color/channel/image]",
    mod: true,
    structure: new SlashCommandBuilder()
        .setName("send")
        .setDescription("Sends and embed message to a channel").setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption((option) =>
            option
                .setName("title")
                .setDescription("The title of the embed")
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName("description")
                .setDescription("The description of the embed")
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName("color")
                .setDescription("The color of the embed")
                .setRequired(true)
        )
        .addChannelOption((option) =>
            option
                .setName("channel")
                .setDescription("The channel to send the embed to")
                .setRequired(false)
        )
        .addStringOption((option) =>
            option
                .setName("image")
                .setDescription("The image of the embed (url only)")
                .setRequired(false)
        ),

    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    run: async (client, interaction) => {
        try {
            const title = interaction.options.getString("title");
            const description = interaction.options.getString("description").replace(/\\n/g, "\n");
            const colorName = interaction.options.getString("color");
            const image = interaction.options.getString("image");
            if (image) {
                if (!image.startsWith("http")) {
                    interaction.reply({
                        content: "`Image must be a url`",
                        ephemeral: true,
                    });
                    return;
                }
            }
            const channel =
                interaction.options.getChannel("channel") ||
                interaction.channel;
            const colorHex = toHex(colorName);
            const color = parseInt(colorHex.replace("#", "0x"), 16);
            let embed = {
                title: `**${title}**`,
                description: description,
                color: color,
                image: {
                    url: image,
                },
                footer: {
                    text: `${interaction.user.tag}`,
                    icon_url: `${interaction.user.displayAvatarURL()}`,
                },
            };
            channel.send({ embeds: [embed] });
            await interaction.reply({
                content: `Sent embed to ${channel}✅`,
                ephemeral: true,
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
