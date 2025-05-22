const { ActivityType, Client, EmbedBuilder, GuildMember } = require("discord.js");
const mongoose = require("mongoose");
const guildDb = require("../../schemas/guild");
const moment = require("moment");

// Module for handling new guild member events
module.exports = {
  event: "guildMemberAdd",
  /**
   * Handles the addition of a new member to a guild
   * @param {Client} client - Discord client instance
   * @param {GuildMember} member - The member who joined the guild
   */
  run: async (client, member) => {
    try {
      const guild = member.guild;
      // Exit if guild is not available
      if (!guild) {
        console.warn("Guild not found for member:", member.id);
        return;
      }

      // Fetch or create guild data in the database
      let guildData = await guildDb.findOne({ guildId: guild.id });
      if (!guildData) {
        guildData = await guildDb.create({ guildId: guild.id });
        console.log(`Added guild ${guild.id} to database`);
      }

      // Check if auto-role feature is enabled
      if (!guildData.autoRoleStatus) {
        return;
      }

      // Assign role based on member type and guild settings
      const assignBotRole = async () => {
        if (!member.user.bot) return;
        const botRole = guild.roles.cache.get(guildData.autoRoleBotsRole);
        if (botRole) {
          await member.roles.add(botRole, "Auto Role for Bots");
        } else {
          console.warn(`Bot role ${guildData.autoRoleBotsRole} not found in guild ${guild.id}`);
        }
      };

      const assignHumanRole = async () => {
        if (member.user.bot) return;
        const humanRole = guild.roles.cache.get(guildData.autoRoleHumansRole);
        if (humanRole) {
          await member.roles.add(humanRole, "Auto Role for Humans");
        } else {
          console.warn(`Human role ${guildData.autoRoleHumansRole} not found in guild ${guild.id}`);
        }
      };

      // Handle role assignment based on configuration
      switch (guildData.autoRoleType) {
        case "bots":
          await assignBotRole();
          break;
        case "humans":
          await assignHumanRole();
          break;
        case "both":
          await Promise.all([assignHumanRole(), assignBotRole()]);
          break;
        default:
          console.warn(`Invalid autoRoleType: ${guildData.autoRoleType} in guild ${guild.id}`);
      }
    } catch (error) {
      console.error(`Error in guildMemberAdd event for guild ${member.guild?.id}:`, error);
    }
  },
};