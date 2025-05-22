// Schema for statistics of bots
const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
    messageContent: String,
    messageId: String,
    channelId: String,
    guildId: String,
    participants: Array,
    time: Number,
    winners: Number,
    ended: {type: Boolean, default: false},
    role: String,
    startedBy: String,
    prize: String
})
module.exports = mongoose.model("giveaway", Schema);