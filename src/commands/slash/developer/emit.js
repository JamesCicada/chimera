const { SlashCommandBuilder } = require("@discordjs/builders");
const { Client, ChatInputCommandInteraction } = require("discord.js");
module.exports = {
	developers: true,
    structure: new SlashCommandBuilder()
        .setName("emit")
        .setDescription("Event emit")
        .setDefaultMemberPermissions(4)
        .addStringOption((option) =>
            option
                .setName("member")
                .setDescription("the member you wanna test on")
                .setRequired(true)
                .addChoices(
                    { name: "guildMemberAdd", value: "guildMemberAdd" },
                    { name: "guildMemberRemove", value: "guildMemberRemove" },
                    { name: "guildCreate", value: "guildCreate" },
                    { name: "guildDelete", value: "guildDelete" }
                )
        ),
        /**
         * 
         * @param {Client} client 
         * @param {ChatInputCommandInteraction} interaction 
         */
        run: async (client, interaction) => {
        const choices = interaction.options.getString("member");
        switch (choices) {
            case "guildMemberAdd":
                {
                    client.emit("guildMemberAdd", interaction.member);
                    interaction.reply("emitted the event successfully");
                }
                break;
            case "guildMemberRemove":
                {
                    client.emit("guildMemberRemove", interaction.member);
                    interaction.reply({ content: "emitted the event successfully", ephemeral: true });
                }
                break;
            case "guildCreate":
                {
                    client.emit("guildCreate", interaction.guild);
                    interaction.reply({ content: "emitted the event successfully", ephemeral: true });
                }
                break;
            case "guildDelete":
                {
                    client.emit("guildDelete", interaction.guild);
                    interaction.reply({ content: "emitted the event successfully", ephemeral: true });
                }
                break;
        }
    },
};
