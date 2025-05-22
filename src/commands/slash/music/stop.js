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
    usage: "stop",
    structure: new SlashCommandBuilder()
      .setName("stop")
      .setDescription("Stop playing music and leave voice channel"),
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
          content: `You can't stop music in other voice channels!`,
          ephemeral: true
        })
      }
      if(!interaction.member.voice?.channelId) {
        return interaction.reply({
          content: `Stop what? Please join a voice channel first!`,
          ephemeral: true
        })
      }
      interaction.reply({content: "Ok, I will leave the voice channel! I hope you enjoyed 😚", ephemeral: true})
      me.voice.disconnect();
    },
  };
  