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
    usage: "pause",
    structure: new SlashCommandBuilder()
      .setName("pause")
      .setDescription("pause the current track"),
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
          content: `You can't pause music in other voice channels!`,
          ephemeral: true,
        });
      }
      if (!interaction.member.voice?.channelId) {
        return interaction.reply({
          content: `Pause what? Please join a voice channel first!`,
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
      distube.pause(interaction.guild);
      interaction.reply({ content: "Paused!" });
    },
  };
  