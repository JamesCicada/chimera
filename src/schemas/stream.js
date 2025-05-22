// Schema for statistics of bots
const mongoose = require("mongoose");

const guildSchema = new mongoose.Schema({
    guildId: String,
    channelId: String,
    tagRole: String,
    editWhenEnd: Boolean,
    messageId: String
})

const Schema = new mongoose.Schema({
    username: String,
    subscribedGuilds: [guildSchema],
    notifiedGuilds: Array,
})
module.exports = mongoose.model("stream", Schema);