const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
    guildId: String,
    logChannels: {
        join: String,
        leave: String,
        kick: String,
        ban: String,
        timeout: String,
        channels: String,
        roles: String,
        voice: String,
        guild: String,
        messages: String
    },
    logStatus: {
        join: Boolean,
        leave: Boolean,
        kick: Boolean,
        ban: Boolean,
        timeout: Boolean,
        channels: Boolean,
        roles: Boolean,
        voice: Boolean,
        guild: Boolean,
        messages: Boolean
    }
});

module.exports = mongoose.model("guildLogs", Schema);