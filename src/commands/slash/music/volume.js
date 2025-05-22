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
  usage: "volume [number]",
  structure: new SlashCommandBuilder()
    .setName("volume")
    .setDescription("Change the volume of the music")
    .addIntegerOption((option) =>
      option
        .setName("level")
        .setDescription("Enter a number between 1 and 100")
        .setMinValue(1)
        .setMaxValue(100)
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
        content: `Nope! Please join a voice channel first!`,
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
    const volume = Math.round(interaction.options.getInteger("level"));
    if(volume) {
        distube.setVolume(interaction.guild, volume);
        interaction.reply({
            content: `🔊 | Volume set to ${volume}%`,
        })
    } else {
        interaction.reply({
            content: `🔊 | Current volume is ${queue.volume}%`,
        })
    }
  },
};
