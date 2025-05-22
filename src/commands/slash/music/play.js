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
  usage: "play [song name/song url/playlist url]",
  structure: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play a song")
    .addStringOption((option) =>
      option
        .setName("query")
        .setDescription("The song/playlist you want to play")
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
        content: `I am busy playing music in ${me.voice.channel}!`,
        ephemeral: true,
      });
    }
    if (!interaction.member.voice?.channelId) {
      return interaction.reply({
        content: `Please join a voice channel first!`,
        ephemeral: true,
      });
    }
    const query = interaction.options.getString("query");
    await distube
    .play(interaction.member.voice?.channel, query, {
      metadata: {
        interaction
      },
    })
    .catch((err) => {
      console.log(err);
    });
    interaction.reply({ content: `Reuqest sent!`, ephemeral: true });
    const queue = distube.getQueue(interaction.guild);
    console.log('queue: ', queue.songs);
    
  },
};
