const {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
    ActionRowBuilder,
    ButtonBuilder,
  } = require("discord.js");
  const memDb = require("../../../schemas/member");
  module.exports = {
    category: 'moderation',
    usage: "warnings [user]",
    structure: new SlashCommandBuilder()
      .setName("warnings")
      .setDescription("View all warnings of a member")
      .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
      .addUserOption((option) =>
        option
          .setName("user")
          .setDescription("The user to get warnings from")
          .setRequired(true)
      ),
    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    run: async (client, interaction) => {
      try {
        let member = interaction.options.getMember("user");
        let memData = await memDb.findOne({
          guildId: interaction.guild.id,
          memberId: member.id,
        })
        if (!memData) return interaction.reply({
          content: `${member} has no warnings`,
          ephemeral: true,
        });
        let warnings = memData.warnings.filter((v) => v.active);
        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("back").setLabel("Back").setStyle("Primary").setEmoji("⬅"),
            new ButtonBuilder().setCustomId("next").setLabel("Next").setStyle("Primary").setEmoji("➡"),
        )
        if(warnings.length > 5) {
            let pageNum = 1;
          page = paginateArray(warnings, pageNum, 5)
            const embed = new EmbedBuilder()
              .setColor("Random")
              .setTitle(`${member.user.username}'s warnings`)
              .setDescription(`
              ${member} has ${warnings.length} warnings!

              ${page.page.map((v) => `> ${v.warningId}\n> Reason: \`\`\`${v.reason.replace(/\`/g, "\\`")}\`\`\`\n> Moderator: <@${v.moderatorId}>`).join("\n\n")}
              `)
            interaction.reply({ embeds: [embed], components: [buttons] }).then((msg) => {
              const filter = i => i.user.id === interaction.user.id;
              const collector = msg.createMessageComponentCollector({ filter, time: 60 * 1000 });
              collector.on('collect', async i => {
                i.deferUpdate()
                if(i.customId === "next") {
                  page = paginateArray(warnings, ++pageNum, 5)
                  pageNum = page.number
                  msg.edit({ embeds: [new EmbedBuilder()
                .setColor("Random")
                .setTitle(`${member.user.username}'s warnings`)
                .setDescription(`
                ${member} has ${warnings.length} warnings!

                ${page.page.map((v) => `> ${v.warningId}\n> Reason: \`\`\`${v.reason.replace(/\`/g, "\\`")}\`\`\`\n> Moderator: <@${v.moderatorId}>`).join("\n\n")}
                 `)]})
                } else if(i.customId === "back") {
                  page = paginateArray(warnings, --pageNum, 5)
                  pageNum = page.number
                  msg.edit({ embeds: [new EmbedBuilder()
                    .setColor("Random")
                    .setTitle(`${member.user.username}'s warnings`)
                    .setDescription(`
                    ${member} has ${warnings.length} warnings!
    
                    ${page.page.map((v) => `> ${v.warningId}\n> Reason: \`\`\`${v.reason.replace(/\`/g, "\\`")}\`\`\`\n> Moderator: <@${v.moderatorId}>`).join("\n\n")}
                     `)]})
                }
            })
            collector.on('end', () => {
              msg.edit({ components: [] })
            })
            })
        } else {
            const embed = new EmbedBuilder()
              .setColor("Random")
              .setTitle(`${member.user.username}'s warnings`)
              .setDescription(`
              ${member} has ${warnings.length} warnings!

              ${warnings.map((v, i) => `> ${i + 1}: \`${v.warningId}\`\n> Reason: \`\`\`${v.reason.replace(/\`/g, "\\`")}\`\`\`\n> Moderator: <@${v.moderatorId}>`).join("\n\n")}
              `)
            interaction.reply({ embeds: [embed] })
        }
      } catch (err) {
        interaction.reply({
          content: `There was an error please check my permissions`,
          ephemeral: true,
        });
        console.log(err);
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
    return {page: array.slice(startIndex, endIndex), number: pageNumber};
  }