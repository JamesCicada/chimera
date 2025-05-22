const {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    Client,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
} = require("discord.js");
module.exports = {
    category: 'utility',
    usage: "invite",
    structure: new SlashCommandBuilder()
        .setName("invite")
        .setDescription("Easily Invite Chimera to your server"),
    /**
     *
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    run: async (client, interaction) => {
        let button = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel('Invite Me?')
                .setEmoji('<:chimera_addguild:1189613407285035188>')
                .setURL('https://discord.com/api/oauth2/authorize?client_id=932901083272081438&permissions=8&scope=bot%20applications.commands')
                .setStyle(5)
        )
        const image = 'https://i.pinimg.com/originals/f4/35/f1/f435f1c9bbf46f532f8119eeb5621126.gif'
            const embed = new EmbedBuilder()
            .setTitle('Invite Chimera!')
            .setDescription(`
            Explore Chimera's new features and commands!
            [Click here to invite Chimera!](https://discord.com/api/oauth2/authorize?client_id=1189594649954877620&permissions=8&scope=bot%20applications.commands)`)
            .setImage(image)
            .setURL('https://discord.com/api/oauth2/authorize?client_id=1189594649954877620&permissions=8&scope=bot%20applications.commands')
            .setColor('Random')
            .setThumbnail(client.user.displayAvatarURL())
        try {
            await interaction.reply({ embeds: [embed], components: [button] });
        } catch (err) {
            interaction.reply({
                content: `There was an error please check my permissions`,
                ephemeral: true,
            });
            console.log(err);
        }
    },
};
