const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
    roleIndex: Number,
    roleId: String,
    roleLabel: String,
    roleEmoji: String
})

const Schema = new mongoose.Schema({
    guildId: String,
    roles: [roleSchema],
    method: String,
    allowMultiple: Boolean,
    limit: Number,
    channelId: String,
    messageId: String,
    counter: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model("selfRole", Schema);