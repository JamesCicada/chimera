const { AutocompleteInteraction } = require("discord.js");
const ExtendedClient = require("../../class/ExtendedClient");

module.exports = {
  commandName: "disable",
  options: {
    public: true,
  },
  /**
   *
   * @param {ExtendedClient} client
   * @param {AutocompleteInteraction} interaction
   */
  run: async (client, interaction) => {
    if (interaction.commandName !== "disable") return;
    const commands = client.collection.interactioncommands.map(
      (v) => v.structure?.name
    ).slice(0, 24);
    // console.log(commands);
    const currentInput = interaction.options.getFocused();
    const filteredCommands = commands.filter((commands) =>
      commands.toLowerCase().startsWith(currentInput.toLowerCase())
    );
    await interaction.respond(
      filteredCommands.map((commands) => ({ name: commands, value: commands }))
    );
  },
};
