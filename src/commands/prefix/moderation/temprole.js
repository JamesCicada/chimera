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
  structure: {
    name: "temprole",
    description: "Give a member a temporary role",
    aliases: ["trole"],
    permissions: PermissionFlagsBits.ManageRoles,
    cooldown: 15000,
  },
  /**
   *
   * @param {Client} client
   * @param {ChatInputCommandInteraction} interaction
   * @returns
   */
  run: async (client, message, args) => {
    const interaction = message;
    try {
      const member =
        message.mentions.members.first() ||
        message.guild.members.cache.get(args[0]);
      const role =
        message.mentions.roles.first() ||
        message.guild.roles.cache.get(args[1]);
      const time = args[2];
      if (!member)
        return message.reply({ content: "Please mention a valid member." });
      if (!role)
        return message.reply({ content: "Please mention a valid role." });
      if (!time)
        return message.reply({
          content: "You should provide a duration. ex: 10m, 10h, 10d",
        });
      const bot = interaction.guild.members.cache.get(client.user.id);
      const duration = new Duration(time);
      // check if role is higher than user or bot
      if (
        interaction.member.roles.highest.comparePositionTo(role) < 1 ||
        bot.roles.highest.comparePositionTo(role) < 1
      ) {
        return interaction.reply({
          content:
            "The role you are trying to give is higher than yours or the bot.",
          ephemeral: true,
        });
      }
      // check if duration is valid
      if (!duration || duration.seconds() < 10 || duration.days() > 90)
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
            moderatorId: interaction.member.id,
            endsAt: endsAt,
          },
        },
      });
      await member.roles.add(
        role.id,
        `Temp role added by ${interaction.author.username}`
      );
      interaction.reply({
        content: `Added ${role} to ${member}\n will be removed at <t:${endsAt}:R>.`,
        ephemeral: true,
      });
      await sendLogs(interaction.guild, "Temp role added", {
        description: `**User:** ${member}\n**Role:** ${role}\n**Ends:** <t:${endsAt}:R>\n**Moderator:** ${interaction.author}`,
        color: "Green",
        avatarURL: interaction.member.displayAvatarURL(),
        username: interaction.author.username,
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
