const {
  Client,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  SelectMenuBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  Presence,
} = require("discord.js");
module.exports = {
  category: 'utility',
  usage: "stats",
  structure: new SlashCommandBuilder()
    .setName("stats")
    .setDescription("Some Basic Stats for this server"),
  run: async (client, interaction) => {
    try {
      //const { channel, member, user, guild } = interaction;
      let guild = interaction.guild;
      let mEmoji = `<:chimera_members:1189612864516935862>`;
      let bEmoji = `<:chimera_booster:1189612872578383952> `;
      let vEmoji = `<:chimera_voice:1189615779721777232>`;
      let oEmoji = `🟢`;
      let notEmoji = `<:chimera_insights:1189612868933517423>`;
      let membersCount = await interaction.guild.memberCount;
      let voiceChannels = await interaction.guild.channels.cache;
      let boosts = await interaction.guild.premiumSubscriptionCount;
      let voiceMembers = 0;
      voiceChannels.forEach((vc) => {
        if (vc.isVoiceBased()) {
          voiceMembers += vc.members.size;
        }
      });
      //console.log(guild.name);
      let members = await guild.fetch();
      let onlineUsers = await guild.approximatePresenceCount;

      let embed = new EmbedBuilder()
        .setTitle(`${notEmoji}  *${interaction.guild.name} Stats*`)
        .setColor("DarkPurple")
        .setDescription(
          `
          > *Members:* **${membersCount}**  ${mEmoji}\n
          > *Online:* **${onlineUsers}**  ${oEmoji}\n
          > *Voice:* **${voiceMembers}**  ${vEmoji}\n
          > *Boosts:* **${boosts}**  ${bEmoji}
      `
        )
        .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
        .setURL("https://discord.gg/nJE5b9GjWv")
        .setFooter({
          text: `${guild.name} stats by Chimera ©`,
          iconURL: `${interaction.guild.iconURL({ dynamic: true })}`,
        });
      await interaction.reply({
        content: 'Done!',
        ephemeral: true
      })
      await interaction.channel.send({ embeds: [embed] });
    } catch (err) {
      console.log(err);
      interaction.reply({
        content: `There was an error please check my permissions`,
        ephemeral: true,
      });
    }
  },
};
