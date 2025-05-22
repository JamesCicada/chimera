// Mongoose schema for join to create vc
const mongoose = require("mongoose");
// schema for vc
const vcSchema = new mongoose.Schema({
    vcId: String,
    rejected: Array,
    ownerId: String,
    bots: Boolean
})
const joinToCreateVCSchema = new mongoose.Schema({
    guildId: String,
    creatorsId: String,
    temps: [vcSchema],
    cooldown: String,
    status: Boolean,
    naming: String,
    customNaming: String,
    cat: String
});

module.exports = mongoose.model("JoinToCreateVC", joinToCreateVCSchema);