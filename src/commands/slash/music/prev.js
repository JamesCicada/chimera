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
    usage: "prev",
    structure: new SlashCommandBuilder()
      .setName("prev")
      .setDescription("prev to a song"),
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
        if(me.voice.channel && me.voice.channelId !== interaction.member.voice?.channelId) {
          return interaction.reply({
            content: `I am busy playing music in ${me.voice.channel}!`,
            ephemeral: true
          })
        }
        if (!interaction.member.voice?.channelId) {
          return interaction.reply({
            content: `huh? Please join a voice channel first!`,
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
          await distube.jump(interaction.guild, -1);
          interaction.reply({content: `Back to the previous song`, ephemeral: true})
    },
  };
  