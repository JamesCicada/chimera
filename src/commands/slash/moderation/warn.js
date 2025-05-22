const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const memDb = require("../../../schemas/member");
module.exports = {
  category: 'moderation',
  usage: "warn [user/reason/anonymous]",
  structure: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Send a warning to a user")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("the user that you wanna warn")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("The warning text")
        .setRequired(false)
    )
    .addBooleanOption((option) =>
      option
        .setName("anonymous")
        .setDescription(
          "Warn anonymously (your name will not be shown in the embed)"
        )
        .setRequired(false)
    ),
  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  run: async (client, interaction) => {
    try {
      let member = interaction.options.getMember("user");
      let user = interaction.options.getUser("user");
      let reason =
        interaction.options.getString("reason") ||
        "Contact moderators for more information";
      let bot = interaction.guild.members.cache.get(client.user.id);
      let anonymous = interaction.options.getBoolean("anonymous") || false;
      if (member && member.id == interaction.guild.ownerId)
        return interaction.reply({
          content: `${member} owns the server so no one of us can warn them`,
          ephemeral: true,
        });
      if (
        member &&
        bot.roles.highest.comparePositionTo(member.roles.highest) < 1
      )
        return interaction.reply({
          content: `${member} has a higher role than you therefor i cannot warn them`,
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
          content: `You can't warn ${member} because they have equal or higher role than yours`,
          ephemeral: true,
        });
      let caseNum = 0;
      // now we get how many warns this guild has
      const memsDb = await memDb
        .find({
          guildId: interaction.guild.id,
        })
        .then((docs) => {
          for (const doc of docs) {
            caseNum += doc.warnings.length;
          }
        });
      caseNum++;
      let memData = await memDb.findOne({
        memberId: member.id,
        guildId: interaction.guild.id,
      });
      if (!memData) {
        memData = memDb.create({
          memberId: member.id,
          guildId: interaction.guild.id,
        });
        memData = await memDb.findOne({
          memberId: member.id,
          guildId: interaction.guild.id,
        });
      }
      memData.warnings.push({
        warningId: caseNum.toString().padStart(4, "0"),
        moderatorId: interaction.user.id,
        reason: reason,
        active: true,
      })
      memData.save();
      member.send({
        embeds:[
          new EmbedBuilder()
          .setDescription(`### You have been warned **${interaction.guild.name}**
          > Reason: ${reason} ${anonymous ? '' : `\nby: ${interaction.user} (${interaction.user.username})`}`)
          .setColor('Red')
        ]
      }).catch((err) => {
        console.log(err)
      })
      interaction.reply({
        content: `${user.tag} (${user.id}) has been warned, case: \`${caseNum.toString().padStart(4, "0")}\`!`,
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
