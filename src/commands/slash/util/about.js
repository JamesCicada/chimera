const {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    Client,
    EmbedBuilder,
} = require("discord.js");
module.exports = {
    category: 'utility',
    usage: "about",
    structure: new SlashCommandBuilder()
        .setName("about")
        .setDescription("About the bot :)"),
    /**
     *
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    run: async (client, interaction) => {
        let embed = new EmbedBuilder().setAuthor({
            name: `About Chimera`,
            iconURL: `${client.user.displayAvatarURL()}`
        }).setColor('Blurple').setDescription(`
        > <:chimera_dev:1189612097617805433> **Devs**: **Chimera**

        > <:chimera_insights:1189612868933517423> **Servers**: \`${client.guilds.cache.size}\`
        
        > <:chimera_members:1189612864516935862> **Users**: \`${client.guilds.cache.reduce((a, b) => a + b.memberCount, 0)}\`
        
        - btw it's pronounced [/kaɪˈmɪəɹə/](https://dictionary.cambridge.org/media/english/us_pron/c/cdo/cdo01/cdo0123uschim0471.mp3)
        `)
        try {
            await interaction.reply({ embeds: [embed] });
        } catch (err) {
            interaction.reply({
                content: `There was an error please check my permissions`,
                ephemeral: true,
            });
            console.log(err);
        }
    },
};
