const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const config = require("../../../config");
const GuildSchema = require("../../../schemas/guild");
const { getCommands } = require("../../../Functions/getHelp");
const commandCats = require("../../../Functions/commandCats");
module.exports = {
  category: "music",
  usage: "loop [track/queue/off]",
  structure: new SlashCommandBuilder()
    .setName("loop")
    .setDescription("Loops the current track/queue")
    .addStringOption((option) =>
      option
        .setName("mode")
        .setDescription("Loop mode")
        .addChoices(
          { name: "Track", value: "track" },
          { name: "Queue", value: "queue" },
          { name: "Off", value: "off" }
        )
        .setRequired(true)
    ),
  options: {
    premium: 1,
  },
  /**
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    const distube = client.distube;
    const me = interaction.guild.members.me;
    if (
      me.voice.channel &&
      me.voice.channelId !== interaction.member.voice?.channelId
    ) {
      return interaction.reply({
        content: `You can't control music in other voice channels!`,
        ephemeral: true,
      });
    }
    if (!interaction.member.voice?.channelId) {
      return interaction.reply({
        content: `Loop what? Please join a voice channel first!`,
        ephemeral: true,
      });
    }
    const queue = distube.getQueue(interaction.guild);
      if (!queue) {
        return interaction.reply({
          content: `There is nothing in the queue!`,
          ephemeral: true,
        });
      }
    const mode = interaction.options.getString("mode");
    const modeNum = mode === "off" ? 0 : mode === "song" ? 1 : 2;
    distube.setRepeatMode(interaction.guild, modeNum);
    interaction.reply({
      content: `🔁 | Loop mode set to ${mode}`,
    })
  },
};
