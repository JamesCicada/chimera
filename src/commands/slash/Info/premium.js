const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  Client,
  ChatInputCommandInteraction,
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
} = require("discord.js");
const gDb = require("../../../schemas/guild");
const moment = require("moment");
module.exports = {
  category: 'utility',
  usage: "premium",
  structure: new SlashCommandBuilder()
    .setName("premium")
    .setDescription("Check information about premium!"),
  /**
   *
   * @param {Client} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    const invite = "https://discord.gg/gNyTSB2j3N";
    const { guild, user, channel, member } = interaction;
    let gData = await gDb.findOne({
      guildId: guild.id,
    });
    if (!gData) {
      await gDb.create({
        guildId: guild.id,
      });
      gData = await gDb.findOne({
        guildId: guild.id,
      });
    }
    console.log(gData);
    console.log(gData.premium);
    const data = {};
    if (gData.premium) {
      data["status"] = gData.premium["status"];
      data["tier"] = gData.premium["tier"];
      data["end"] = gData.premium["end"];
      data["started"] = gData.premium["started"];
      console.log(data);
      const embed = new EmbedBuilder()
        .setTitle("Premium Status")
        .setDescription(
          `
        ### Premium Data for ${guild.name}

        > Status: ${data["status"] ? "Active" : "Inactive"}

        > Type: ${data["tier"]}

        > End: <t:${data["end"]}:R>

        > Started: <t:${data["started"]}:R>
        `
        )
        .setColor("Green");
      interaction.reply({ embeds: [embed] });
    } else {
      const embed = new EmbedBuilder()
        .setTitle("Premium Status")
        .setDescription(
          `
        ### Premium Data for ${guild.name}

        This guild is not premium

        To get premium join [Chimera's Support Server](${invite})
        `
        ).setURL(invite)
        .setColor("Red");
      interaction.reply({ embeds: [embed] });
    }
  },
};
