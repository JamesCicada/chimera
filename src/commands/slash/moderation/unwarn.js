const {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
  } = require("discord.js");
  const memDb = require("../../../schemas/member");
  module.exports = {
    category: 'moderation',
    usage: "unwarn [user] [caseId]",
    structure: new SlashCommandBuilder()
      .setName("unwarn")
      .setDescription("remove a warning from a member")
      .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
      .addUserOption((option) =>
        option
          .setName("user")
          .setDescription("the user that you wanna warn")
          .setRequired(true)
      ).addStringOption((option) =>
      option
        .setName("case-id")
        .setDescription("The case id")
        .setRequired(true)
    ),
    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    run: async (client, interaction) => {
      try {
        let member = interaction.options.getMember("user");
        let caseId = interaction.options.getString("case-id");
        if (member && member.id == interaction.guild.ownerId)
          return interaction.reply({
            content: `${member} owns the server so no one of us can unwarn them`,
            ephemeral: true,
          });
        if (
          member &&
          interaction.member.roles.highest.comparePositionTo(
            member.roles.highest
          ) < 1 &&
          interaction.member.id != interaction.guild.ownerId
        )
          return interaction.reply({
            content: `You can't unwarn ${member} because they have equal or higher role than yours`,
            ephemeral: true,
          });
          let memData = await memDb.findOne({
            guildId: interaction.guild.id,
            memberId: member.id,
          })
          if (!memData) return interaction.reply({
            content: `${member} has no warnings`,
            ephemeral: true,
          })
          memData.warnings = memData.warnings.map((v) => {
            if (v.warningId == caseId) {
              v.active = false;
            }
            return v;
          });
          await memData.save();
            interaction.reply({
          content: `warning case ${caseId} has been removed from ${member}`,
          })
      } catch (err) {
        interaction.reply({
          content: `There was an error please check my permissions`,
          ephemeral: true,
        });
        console.log(err);
      }
    },
  };
  