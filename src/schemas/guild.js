const mongoose = require("mongoose");

const pollSchema = new mongoose.Schema({
  id: String,
  choice1: Array,
  choice2: Array,
  choice3: Array,
  choice4: Array,
});

const counterSchema = new mongoose.Schema({
  channelId: String,
  name: String,
  counterType: String,
});

const autoRoleSchema = new mongoose.Schema({
  autoRoleStatus: {
    type: Boolean,
    default: false,
  },
  autoRoleType: String,
  role: String,
});

const aliasSchema = new mongoose.Schema({
  commandName: {
    type: String,
    required: true,
  },
  alias: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Schema = new mongoose.Schema({
  guildId: String,
  guildRules: String,
  welcomeStatus: {
    type: Boolean,
    default: false,
  },
  prefixStatus: {
    type: Boolean,
    default: true,
  },
  prefix: String,
  welcomeMessage: String,
  welcomeImages: Array,
  welcomeChannel: String,
  boostStatus: {
    type: Boolean,
    default: false,
  },
  boostImages: Array,
  boostChannel: String,
  logsStatus: {
    type: Boolean,
    default: false,
  },
  logsChannel: String,
  auditLogsStatus: {
    type: Boolean,
    default: false,
  },
  auditLogsChannel: String,
  byeStatus: {
    type: Boolean,
    default: false,
  },
  byeMessage: String,
  byeImages: Array,
  byeChannel: String,
  verificationStatus: {
    type: Boolean,
    default: false,
  },
  verificationMethod: String,
  verificationMessage: String,
  verificationChannel: String,
  verificationReq: String,
  verifiedRole: String,
  MutedRole: String,
  ModsRoles: Array,
  staffsRoles: Array,
  botsWlStatus: {
    type: Boolean,
    default: false,
  },
  botWl: Array,
  jailed: Array,
  autoRole: [autoRoleSchema],
  notificationsChannel: String,
  twitchChannels: Array,
  YoutubeChannels: Array,
  disabledCommands: Array,
  disabledChannels: Array,
  panelsCount: Number,
  maxWarnings: Number,
  maxWarningsPunishment: String,
  premium: {
    status: {
      type: Boolean,
      default: false,
    },
    started: String,
    end: String,
    tier: String,
  },
  counters: [counterSchema],
  aliases: {
    type: [aliasSchema],
    validate: {
      validator: function (aliases) {
        const maxAliases = this.premium.status ? 100 : 10;
        return aliases.length <= maxAliases;
      },
      message: props =>
        `Alias limit exceeded. Maximum allowed: ${props.instance.premium.status ? 100 : 10}`,
    },
  },
});

module.exports = mongoose.model("guildSettings", Schema);