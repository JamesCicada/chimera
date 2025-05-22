// Schema for statistics of bots
const mongoose = require("mongoose");

const codeSchema = new mongoose.Schema({
    code: String,
    tier: String,
    duration: String,
    redeemedBy: String,
})

const Schema = new mongoose.Schema({
    botId: String,
    commandsUsed: Number,
    messagesSent: Number,
    channelsCreated: Number,
    usersBanned: Number,
    usersKicked: Number,
    usersVerified: Number,
    blacklistedUsers: Array,
    blacklistedGuilds: Array,
})
module.exports = mongoose.model("bot", Schema);