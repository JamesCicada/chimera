// nowplaying
const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const moment = require("moment");
module.exports = {
  category: "music",
  usage: "nowplaying",
  structure: new SlashCommandBuilder()
    .setName("nowplaying")
    .setDescription("Show now playing song and loop mode + seek"),
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
        content: `You can't see music from other voice channels!`,
        ephemeral: true,
      });
    }
    if (!interaction.member.voice?.channelId) {
      return interaction.reply({
        content: `Please join a voice channel first!`,
        ephemeral: true,
      });
    }
    const queue = distube.getQueue(interaction.guild);
    if (!queue || queue.songs.length === 0) {
      return interaction.reply({
        content: `There is nothing in the queue!`,
        ephemeral: true,
      });
    }
    const song = queue.songs[0];
    const currentTime = queue.voice.playbackDuration + queue.beginTime;
    console.log('queue: ', queue);
    // console.log('song: ', song);
    
    if (song?.isLive) {
      const embed = new EmbedBuilder()
        .setTitle(`Queue Size ${queue.songs.length}`)
        .setDescription(
          `Now playing: [${song.name}](${song.url})\nLoop mode: ${
            queue.repeatMode == 0
              ? "Off"
              : queue.repeatMode == 1
              ? "Song"
              : "Queue"
          }\n🔴 Live\nTime left: ${moment(left).format("hh:mm:ss")}`
        )
        .setThumbnail(song.thumbnail);
      interaction.reply({ embeds: [embed] });
    } else {
      const currentTime = queue.voice.playbackDuration + queue.beginTime;
      const seek = currentTime;
      const left = song.duration * 1000 - seek;
      let seekbar = "";
      for (let i = 0; i < 15; i++) {
        if (i === Math.round((15 * seek) / song.duration)) {
          seekbar += "🟣";
        } else {
          seekbar += "▬";
        }
      }
      const embed = new EmbedBuilder()
        .setTitle(`Queue Size ${queue.songs.length}`)
        .setDescription(
          `Now playing: [${song.name}](${song.url})\nLoop mode: ${
            queue.repeatMode == 0
              ? "Off"
              : queue.repeatMode == 1
              ? "Song"
              : "Queue"
          }\n${seekbar}\nTime left: ${moment(left).format("mm:ss")}`
        )
        .setThumbnail(song.thumbnail);
      interaction.reply({ embeds: [embed] });
    }
  },
};
