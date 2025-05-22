const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  Client,
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
} = require("discord.js");
const guildDb = require("../../../schemas/guild");
const mDb = require("../../../schemas/member");
const moment = require("moment");
const Duration = require("duration-js");
const { sendLogs } = require("../../../Functions/actionLogs");
module.exports = {
  category: "moderation",
  usage: "temprole [user] [role] [time]",
  structure: new SlashCommandBuilder()
    .setName("temprole")
    .setDescription("give a user a temporary role")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to give the role to")
        .setRequired(true)
    )
    .addRoleOption((option) =>
      option
        .setName("role")
        .setDescription("The role to be given to the user")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("time")
        .setDescription("Time before the role is removed (ex: 10m, 10h, 10d)")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
  /**
   *
   * @param {Client} client
   * @param {ChatInputCommandInteraction} interaction
   * @returns
   */
  run: async (client, interaction) => {
    try {
      const member = interaction.options.getMember("user");
      const role = interaction.options.getRole("role");
      const time = interaction.options.getString("time");
      const bot = interaction.guild.members.cache.get(client.user.id);
      const duration = new Duration(time);
      // check if role is higher than user or bot
      if(interaction.member.roles.highest.comparePositionTo(role) < 1 || bot.roles.highest.comparePositionTo(role) < 1) {
        return interaction.reply({
          content: "The role you are trying to give is higher than yours or the bot.",
          ephemeral: true,
        });
      }
      // check if duration is valid
      if (!duration ||duration.seconds() < 10 || duration.days() > 90)
        return interaction.reply({
          content: "You can only set a time between 10 seconds and 90 days.",
          ephemeral: true,
        });
      let gData = await guildDb.findOne({ guildId: interaction.guild.id });
      if (!gData) {
        await guildDb.create({
          guildId: interaction.guild.id,
        });
        gData = await guildDb.findOne({ guildId: interaction.guild.id });
      }
      let memData = await mDb.findOne({
        guildId: interaction.guild.id,
        memberId: member.id,
      });
      if (!memData) {
        await mDb.create({
          guildId: interaction.guild.id,
          memberId: member.id,
        });
        memData = await mDb.findOne({
          guildId: interaction.guild.id,
          memberId: member.id,
        });
      }
      if (!gData.premium.status && memData.tempRoles.length >= 1) {
        return interaction.reply({
          content: "Non premium servers can only have 1 temp roles per member.",
          ephemeral: true,
        });
      }
      if (member.roles.cache.has(role.id))
        return interaction.reply({
          content: "The member already has that role.",
          ephemeral: true,
        });
      let endsAt = moment().add(duration.seconds(), "seconds").unix();
      await memData.updateOne({
        $addToSet: {
          tempRoles: {
            roleId: role.id,
            moderatorId: interaction.user.id,
            endsAt: endsAt,
          },
        },
      });
      await member.roles.add(role.id, `Temp role added by ${interaction.user.username}`);
      interaction.reply({
        content: `Added ${role} to ${member}\n will be removed at <t:${endsAt}:R>.`,
        ephemeral: true,
      });
      await sendLogs(interaction.guild, 'Temp role added', {
        description: `**User:** ${member}\n**Role:** ${role}\n**Ends:** <t:${endsAt}:R>\n**Moderator:** ${interaction.user}`,
        color: "Green",
        avatarURL: interaction.member.displayAvatarURL(),
        username: interaction.user.username,
      });
    } catch (err) {
      interaction.reply({
        content: "There was an error. Please check my permissions.",
        ephemeral: true,
      });
      console.error(err);
    }
  },
};

