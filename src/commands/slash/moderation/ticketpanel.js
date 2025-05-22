const {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
    ButtonBuilder,
    ActionRowBuilder,
    ChannelType
} = require("discord.js");

module.exports = {
    mod: true,
    usage: "create-ticket [text/channel?/button-1?/button-2?/button-3?]",
    category: 'tickets',
    structure: new SlashCommandBuilder()
        .setName("create-ticket")
        .setDescription("Sends a panel for opening tickets")
        // .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption((option) =>
            option
                .setName("text")
                .setDescription("The text to be sent with the embed (use \\n for new line and basic embed formatting)")
                .setMaxLength(500)
                .setRequired(true)
        ).addChannelOption((option) => option.setName('channel')
            .setDescription('The channel to send the panel (Default this one)')
            .addChannelTypes(ChannelType.GuildText))
        .addStringOption((option) =>
            option
                .setName("button-1")
                .setDescription("The text of the button 1 (default Support)")
        ).addStringOption((option) =>
            option
                .setName("button-2")
                .setDescription("The text of the button 2 (default none) leave empty if you don't need it")
        ).addStringOption((option) =>
            option
                .setName("button-3")
                .setDescription("The text of the button 3 (default none) leave empty if you don't need it")
        ).addStringOption((option) => option.setName('image-link').setDescription('The image Link that should be provided with the panel')),
    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    run: async (client, interaction) => {
        try {
            const text = interaction.options.getString("text")
            const channel = interaction.options.getChannel("channel") || interaction.channel;
            const button1 = interaction.options.getString("button-1");
            const button2 = interaction.options.getString("button-2");
            const button3 = interaction.options.getString("button-3");
            const image = interaction.options.getString("image-link");
            const search = '\\n';
            const replaceWith = `\n`;
            let embed = new EmbedBuilder()
                .setImage(image||'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExYnN0cHB2N3Q3c2R3YzVtYWN0Z2ZpcWY1cXRuNHk3MWY1NHN2NDN6ZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/8l8t2PM41XwgmBFyuE/giphy.gif')
            let buttons = []
            if (text && text != '') {
                embed.setDescription(text.split(search).join(replaceWith)).setColor('DarkButNotBlack')
            }

            channel.send({
                content: `Creating tickets panel...`
            }).then(async (message) => {
                if (button1 && text != '') {
                    buttons.push(new ButtonBuilder().setLabel(button1).setCustomId(`support-ticket-1-${message.id}`).setStyle('Primary'))
                } else {
                    buttons.push(new ButtonBuilder().setLabel('Support').setCustomId(`support-ticket-1-${message.id}`).setStyle('Primary'))
                }
                if (button2 && text != '') {
                    buttons.push(new ButtonBuilder().setLabel(button2).setCustomId(`support-ticket-2-${message.id}`).setStyle('Primary'))
                }
                if (button3 && text != '') {
                    buttons.push(new ButtonBuilder().setLabel(button3).setCustomId(`support-ticket-3-${message.id}`).setStyle('Primary'))
                }
                let row = new ActionRowBuilder().addComponents(
                    buttons
                )
                message.edit({
                    content: '',
                    embeds: [
                        embed
                    ],
                    components: [
                        row
                    ]
                })
                interaction.reply({
                    content: `Sent to ${interaction.channel}`,
                    ephemeral: true
                })
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
