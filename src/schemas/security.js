const mongoose = require("mongoose");
const Schema = new mongoose.Schema({
    guildId: String,
    securityLogs: String,
    securityLogsChannel: String,
    spamStatus: String,
    spamPeriod: String,
    spamMax: String,
    spamPunishment: Array,
    inviteStatus: String,
    inviteType: String,
    invitePunishment: Array,
    blwordsStatus: String,
    blwordsPeriod: String,
    blwordsMax: String,
    blwordsPunishment: Array,
    securityStatus: {
        type: Boolean,
        default: false
    },
    securityTypes: Array, // ['antichanneledit', 'antiroleedit', 'antiguildedit', 'antibans', 'antikicks', 'bots', 'humans']
    whitelistedRoles: Array,
    whitelistedMembers: Array,
    securityRatelimit: String,
    securityTimestamp: String,
})
module.exports = mongoose.model("guildSecurity", Schema);
