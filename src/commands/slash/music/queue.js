const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const config = require("../../../config");
const GuildSchema = require("../../../schemas/guild");
const { getCommands } = require("../../../Functions/getHelp");
const commandCats = require("../../../Functions/commandCats");
module.exports = {
  category: "music",
  usage: "queue",
  structure: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("Show the current queue!"),
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
        content: `You can't check the queue of other voice channels!`,
        ephemeral: true,
      });
    }
    if (!interaction.member.voice?.channelId) {
      return interaction.reply({
        content: `huh? Please join a voice channel first!`,
        ephemeral: true,
      });
    }
    const mode = interaction.options.getString("mode");
    const modeNum = mode === "off" ? 0 : mode === "song" ? 1 : 2;
    const queue = distube.getQueue(interaction.guild);
    if (!queue) {
      return interaction.reply({
        content: `There is nothing in the queue!`,
        ephemeral: true,
      });
    }
    if (queue.songs.length <= 10) {
      const embed = new EmbedBuilder()
        .setTitle(`Queue ${queue.songs.length} Songs`)
        .setDescription(
          queue.songs
            .map(
              (song, i) =>
                `${i + 1}. [${song.name}](${song.url}) - \`${
                  song.formattedDuration
                }\``
            )
            .join("\n")
        )
        .setColor("Random");
      return interaction.reply({
        embeds: [embed],
      });
    } else {
      const randomId = Math.floor(Math.random() * 100000);
      const pages = paginateArray(queue.songs, 1, 10);
      let pageNum = 1;
      let embed = new EmbedBuilder()
        .setTitle(`Queue ${queue.songs.length} Songs`)
        .setDescription(
          pages.page
            .map(
              (song, i) =>
                `${i + 1}. [${song.name}](${song.url}) - \`${
                  song.formattedDuration
                }\``
            )
            .join("\n")
        )
        .setColor("Random");
      const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel("⏮")
          .setStyle("Secondary")
          .setCustomId(`1st-page-${randomId}`),
        new ButtonBuilder()
          .setLabel("◀")
          .setStyle("Secondary")
          .setCustomId(`prev-page-${randomId}`),
        new ButtonBuilder()
          .setLabel("▶")
          .setStyle("Secondary")
          .setCustomId(`next-page-${randomId}`),
        new ButtonBuilder()
          .setLabel("⏭")
          .setStyle("Secondary")
          .setCustomId(`last-page-${randomId}`)
      );
      await interaction
        .reply({ embeds: [embed], components: [buttons] })
        .then(async (msg) => {
          const filter = (i) => i.user.id === interaction.user.id;
          const collector = msg.createMessageComponentCollector({
            filter,
            time: 30 * 1000,
          });
          collector
            .on("collect", async (i) => {
              await i.update({ embeds: [embed], components: [buttons] });
              if (i.customId.split("-")[2] != randomId)
                return console.log(i.customId.split("-")[2]);
              if (i.customId.startsWith("1st-page")) {
                let page = paginateArray(queue.songs, 1, 10);
                pageNum = 0;
                embed.setDescription(
                  page.page
                    .map(
                      (song, i) =>
                        `${i + 1}. [${song.name}](${song.url}) - \`${
                          song.formattedDuration
                        }\``
                    )
                    .join("\n")
                );
                await msg.edit({ embeds: [embed], components: [buttons] });
              } else if (i.customId.startsWith("prev-page")) {
                let page = paginateArray(queue.songs, pageNum - 1, 10);
                pageNum = page.number;
                embed.setDescription(
                  page.page
                    .map(
                      (song, i) =>
                        `${page.from > 1 ? page.from + i : page.from}. [${song.name}](${
                          song.url
                        }) - \`${song.formattedDuration}\``
                    )
                    .join("\n")
                );
                await msg.edit({ embeds: [embed], components: [buttons] });
              } else if (i.customId.startsWith("next-page")) {
                let page = paginateArray(queue.songs, pageNum + 1, 10);
                pageNum = page.number;
                embed.setDescription(
                  page.page
                    .map(
                      (song, i) =>
                        `${page.from > 1 ? page.from + i : page.from}. [${song.name}](${
                          song.url
                        }) - \`${song.formattedDuration}\``
                    )
                    .join("\n")
                );
                await msg.edit({ embeds: [embed], components: [buttons] });
              } else if (i.customId.startsWith("last-page")) {
                let page = paginateArray(
                  queue.songs,
                  Math.ceil(queue.songs.length / 10),
                  10
                );
                pageNum = page.number;
                embed.setDescription(
                  page.page.map(
                    (song, i) =>
                      `${page.from > 1 ? page.from + i : page.from}. [${song.name}](${
                        song.url
                      }) - \`${song.formattedDuration}\``
                  ).join("\n")
                );
                await msg.edit({ embeds: [embed], components: [buttons] });
              }
            })
            .on("end", () => {
              msg.edit({ components: [] });
            });
        });
    }
  },
};
function paginateArray(array, pageNumber, perPage) {
  // Check if the page number is valid
  if (pageNumber < 1 || pageNumber > Math.ceil(array.length / perPage)) {
    pageNumber = 1;
  }

  // Calculate the starting index of the page
  const startIndex = (pageNumber - 1) * perPage;

  // Calculate the ending index of the page
  const endIndex = Math.min(startIndex + perPage, array.length);

  // Return the paginated array
  return { page: array.slice(startIndex, endIndex), number: pageNumber, from: startIndex + 1, to: endIndex + 1 };
}
