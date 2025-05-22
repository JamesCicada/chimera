const { PermissionFlagsBits, Guild } = require("discord.js");
const { client } = require('../class/ExtendedClient')
const auditLogEvents = {
  ApplicationCommandPermissionUpdate: 121,
  AutoModerationBlockMessage: 143,
  AutoModerationFlagToChannel: 144,
  AutoModerationRuleCreate: 140,
  AutoModerationRuleDelete: 142,
  AutoModerationRuleUpdate: 141,
  AutoModerationUserCommunicationDisabled: 145,
  BotAdd: 28,
  ChannelCreate: 10,
  ChannelDelete: 12,
  ChannelOverwriteCreate: 13,
  ChannelOverwriteDelete: 15,
  ChannelOverwriteUpdate: 14,
  ChannelUpdate: 11,
  CreatorMonetizationRequestCreated: 150,
  CreatorMonetizationTermsAccepted: 151,
  EmojiCreate: 60,
  EmojiDelete: 62,
  EmojiUpdate: 61,
  GuildScheduledEventCreate: 100,
  GuildScheduledEventDelete: 102,
  GuildScheduledEventUpdate: 101,
  GuildUpdate: 1,
  IntegrationCreate: 80,
  IntegrationDelete: 82,
  IntegrationUpdate: 81,
  InviteCreate: 40,
  InviteDelete: 42,
  InviteUpdate: 41,
  MemberBanAdd: 22,
  MemberBanRemove: 23,
  MemberDisconnect: 27,
  MemberKick: 20,
  MemberMove: 26,
  MemberPrune: 21,
  MemberRoleUpdate: 25,
  MemberUpdate: 24,
  MessageBulkDelete: 73,
  MessageDelete: 72,
  MessagePin: 74,
  MessageUnpin: 75,
  RoleCreate: 30,
  RoleDelete: 32,
  RoleUpdate: 31,
  StageInstanceCreate: 83,
  StageInstanceDelete: 85,
  StageInstanceUpdate: 84,
  StickerCreate: 90,
  StickerDelete: 92,
  StickerUpdate: 91,
  ThreadCreate: 110,
  ThreadDelete: 112,
  ThreadUpdate: 111,
  WebhookCreate: 50,
  WebhookDelete: 52,
  WebhookUpdate: 51,
};
/**
 * 
 * @param {Guild} guild
 * @returns 
 */
const getResMem = async (client, guild, eventName, channel, timestamp) => {
  try {
    const hasPermission = guild.members.me.permissions.has(PermissionFlagsBits.ViewAuditLog);
    if (!hasPermission) return null;

    const eventType = auditLogEvents[eventName];
    const logs = await guild.fetchAuditLogs({ type: eventType, limit: 10 });

    const timeWindow = 300; // milliseconds
    const targetTime = new Date(timestamp).getTime();
    
    const matchingEntry = logs.entries.find((entry) => {
      const entryTime = entry.createdTimestamp;
      const channelMatches = channel?.id ? entry.extra?.channel?.id === channel?.id : true;
      const withinTimeOffset = Math.abs(entryTime - targetTime) <= timeWindow;
      return channelMatches && withinTimeOffset;
    });

    if (!matchingEntry) return null;

    const entryId = matchingEntry.id;
    const count = matchingEntry.extra?.count;
    let updated = true;

    if (client.audit.has(entryId)) {
      if (count && count === client.audit.get(entryId)) {
        updated = false;
      }
    }

    client.audit.set(entryId, count);

    if (!client.auditTimeouts?.has(entryId)) {
      if (!client.auditTimeouts) client.auditTimeouts = new Map();
      const timeout = setTimeout(() => {
        client.audit.delete(entryId);
        client.auditTimeouts.delete(entryId);
      }, 5 * 60 * 1000);
      client.auditTimeouts.set(entryId, timeout);
    }

    if (updated) {
      return matchingEntry.executor;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return null;
  }
};
module.exports = { getResMem };